import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { exportTrackingSpreadsheet, importTrackingSpreadsheet, updateUsername } from '@/api/endpoints';
import type { SpreadsheetImportMode } from '@/api/types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAuth } from '@/hooks/useAuth';
import { downloadBlob } from '@/lib/download';
import { formatDisplayDate } from '@/lib/dates';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usernameInput, setUsernameInput] = useState(user?.username ?? '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [importMode, setImportMode] = useState<SpreadsheetImportMode>('merge');
  const [spreadsheetMessage, setSpreadsheetMessage] = useState<string | null>(null);

  useEffect(() => {
    setUsernameInput(user?.username ?? '');
  }, [user?.username]);

  const shareUrl = useMemo(() => {
    if (!user?.username) return null;
    return `${window.location.origin}/${user.username}/stats`;
  }, [user?.username]);

  const usernameMutation = useMutation({
    mutationFn: updateUsername,
    onSuccess: async () => {
      await refreshUser();
      void queryClient.invalidateQueries({ queryKey: ['shared-stats-profile'] });
      setSaveMessage('Username saved');
      setTimeout(() => setSaveMessage(null), 3000);
    },
  });

  const exportMutation = useMutation({
    mutationFn: ({ from, to }: { from?: string; to?: string }) =>
      exportTrackingSpreadsheet(from, to),
    onSuccess: (blob) => {
      downloadBlob(blob, 'fatoven-tracker.xlsx');
      setSpreadsheetMessage('Export downloaded');
      setTimeout(() => setSpreadsheetMessage(null), 4000);
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => importTrackingSpreadsheet(file, importMode),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['daily'] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-assessments'] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-summaries'] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-assessment'] });
      const range =
        result.dateRange.from && result.dateRange.to
          ? `${result.dateRange.from} — ${result.dateRange.to}`
          : 'no dates';
      setSpreadsheetMessage(
        `Imported ${result.imported.dailyLogs} daily rows and ${result.imported.weeklyAssessments} weekly check-ins (${range})`,
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSpreadsheetMessage(null), 8000);
    },
  });

  const spreadsheetError = exportMutation.error || importMutation.error;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveUsername = () => {
    usernameMutation.mutate(usernameInput.trim().toLowerCase());
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setSaveMessage('Share link copied');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleImport = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setSpreadsheetMessage('Choose an .xlsx file first');
      setTimeout(() => setSpreadsheetMessage(null), 3000);
      return;
    }

    if (importMode === 'replace') {
      const ok = window.confirm(
        'Replace mode will delete all your existing logs and check-ins before import. Continue?',
      );
      if (!ok) return;
    }

    importMutation.mutate(file);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          {user.displayName && (
            <div>
              <p className="text-sm text-muted-foreground">Display name</p>
              <p className="font-medium">{user.displayName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="font-medium">{formatDisplayDate(user.createdAt.slice(0, 10))}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Log out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shareable stats page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a username for your stats URL. Logged-in collaborators can open your page in
            read-only mode.
          </p>

          {usernameMutation.error && (
            <Alert variant="destructive">
              <ApiErrorAlert error={usernameMutation.error} />
            </Alert>
          )}
          {saveMessage && <Alert>{saveMessage}</Alert>}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
              placeholder="mitch"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">3–30 characters: a-z, 0-9, underscore</p>
          </div>

          <Button
            type="button"
            onClick={handleSaveUsername}
            disabled={usernameMutation.isPending || !usernameInput.trim()}
          >
            {usernameMutation.isPending ? 'Saving…' : 'Save username'}
          </Button>

          {shareUrl ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">Your share link</p>
              <p className="break-all text-sm text-muted-foreground">{shareUrl}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => void handleCopyShareLink()}>
                  Copy link
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/${user.username}/stats`)}>
                  Open my stats page
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Save a username to get your share link.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spreadsheet backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Export or import your tracker as an Excel file (Tracker sheet with daily logs, weekly
            averages, and check-ins).
          </p>

          {spreadsheetError && (
            <Alert variant="destructive">
              <ApiErrorAlert error={spreadsheetError} />
            </Alert>
          )}
          {spreadsheetMessage && <Alert>{spreadsheetMessage}</Alert>}

          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">Export</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="export-from">From (optional)</Label>
                <Input
                  id="export-from"
                  type="date"
                  value={exportFrom}
                  max={exportTo || undefined}
                  onChange={(e) => setExportFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-to">To (optional)</Label>
                <Input
                  id="export-to"
                  type="date"
                  value={exportTo}
                  min={exportFrom || undefined}
                  onChange={(e) => setExportTo(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={exportMutation.isPending}
                onClick={() =>
                  exportMutation.mutate({
                    from: exportFrom || undefined,
                    to: exportTo || undefined,
                  })
                }
              >
                {exportMutation.isPending ? 'Exporting…' : 'Download .xlsx'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate({})}
              >
                Whole period
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use the date range for a partial export, or Whole period for all data. File:
              fatoven-tracker.xlsx
            </p>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">Import</p>
            <div className="space-y-2">
              <Label htmlFor="import-file">Excel file (.xlsx)</Label>
              <Input
                id="import-file"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              />
            </div>
            <div className="space-y-2">
              <Label>Import mode</Label>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                  />
                  Merge — upsert existing rows
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  Replace — delete all data, then import
                </label>
              </div>
            </div>
            <Button
              type="button"
              disabled={importMutation.isPending}
              onClick={handleImport}
            >
              {importMutation.isPending ? 'Importing…' : 'Import spreadsheet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
