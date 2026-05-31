import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { updateUsername } from '@/api/endpoints';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAuth } from '@/hooks/useAuth';
import { formatDisplayDate } from '@/lib/dates';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [usernameInput, setUsernameInput] = useState(user?.username ?? '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
    </div>
  );
}
