import { useEffect, useMemo, useState } from 'react';
import { AdminConfig } from '@/types/admin-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const toPretty = (value: unknown) => JSON.stringify(value, null, 2);

interface EditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  resetValue: string;
}

const JsonEditor = ({ label, value, onChange, resetValue }: EditorProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{label}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onChange(resetValue)}>
          Reset section
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono min-h-[280px]"
        />
      </CardContent>
    </Card>
  );
};

const parseSection = (value: string, key: keyof AdminConfig) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${key} is not valid JSON: ${(error as Error).message}`);
  }
};

const Admin = () => {
  const [loadedConfig, setLoadedConfig] = useState<AdminConfig | null>(null);
  const [defaults, setDefaults] = useState<AdminConfig | null>(null);
  const [themeText, setThemeText] = useState('');
  const [contentText, setContentText] = useState('');
  const [layoutText, setLayoutText] = useState('');
  const [catalogText, setCatalogText] = useState('');
  const [navigationText, setNavigationText] = useState('');
  const [featureFlagsText, setFeatureFlagsText] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [isSaving, setIsSaving] = useState(false);

  const setEditorsFromConfig = (config: AdminConfig) => {
    setThemeText(toPretty(config.theme));
    setContentText(toPretty(config.content));
    setLayoutText(toPretty(config.layout));
    setCatalogText(toPretty(config.catalog));
    setNavigationText(toPretty(config.navigation));
    setFeatureFlagsText(toPretty(config.featureFlags));
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [configRes, defaultsRes] = await Promise.all([
          fetch('/admin-api/config'),
          fetch('/admin-api/defaults'),
        ]);

        if (configRes.ok) {
          const config = await configRes.json();
          setLoadedConfig(config);
          setEditorsFromConfig(config);
        }

        if (defaultsRes.ok) {
          const defaultsConfig = await defaultsRes.json();
          setDefaults(defaultsConfig);
        }
      } catch (error) {
        console.error('Error loading admin config', error);
        toast.error('Unable to load admin configuration.');
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    localStorage.setItem('adminToken', token);
  }, [token]);

  const parsedPayload = useMemo(() => {
    if (!loadedConfig) return null;
    try {
      return {
        theme: parseSection(themeText, 'theme'),
        content: parseSection(contentText, 'content'),
        layout: parseSection(layoutText, 'layout'),
        catalog: parseSection(catalogText, 'catalog'),
        navigation: parseSection(navigationText, 'navigation'),
        featureFlags: parseSection(featureFlagsText, 'featureFlags'),
      } as AdminConfig;
    } catch (error) {
      return error as Error;
    }
  }, [themeText, contentText, layoutText, catalogText, navigationText, featureFlagsText, loadedConfig]);

  const handleSave = async () => {
    if (!parsedPayload || parsedPayload instanceof Error) {
      toast.error((parsedPayload as Error)?.message || 'Unable to save.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/admin-api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(parsedPayload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Save failed');
      }

      const saved = await res.json();
      setLoadedConfig(saved);
      setEditorsFromConfig(saved);
      setPreviewKey((key) => key + 1);
      toast.success('Configuration saved. The preview iframe will refresh automatically.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!defaults) return;
    setEditorsFromConfig(defaults);
    try {
      const res = await fetch('/admin-api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
      });
      if (res.ok) {
        setPreviewKey((key) => key + 1);
        toast.success('Configs reset to defaults.');
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const validationError = parsedPayload instanceof Error ? parsedPayload.message : '';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Local Admin Panel</h1>
          <p className="text-muted-foreground">Edit the config JSON files and generate a live preview.</p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <label className="text-sm font-medium" htmlFor="admin-token">Admin Token</label>
          <Input
            id="admin-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Provide ADMIN_TOKEN if set"
            className="min-w-[240px]"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="theme" className="space-y-4">
            <TabsList className="w-full flex flex-wrap">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="content">Copy</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="catalog">Catalog</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="featureFlags">Feature Flags</TabsTrigger>
            </TabsList>
            <TabsContent value="theme">
              <JsonEditor
                label="Theme"
                value={themeText}
                onChange={setThemeText}
                resetValue={toPretty(defaults?.theme ?? {})}
              />
            </TabsContent>
            <TabsContent value="content">
              <JsonEditor
                label="Copy"
                value={contentText}
                onChange={setContentText}
                resetValue={toPretty(defaults?.content ?? {})}
              />
            </TabsContent>
            <TabsContent value="layout">
              <JsonEditor
                label="Layout"
                value={layoutText}
                onChange={setLayoutText}
                resetValue={toPretty(defaults?.layout ?? {})}
              />
            </TabsContent>
            <TabsContent value="catalog">
              <JsonEditor
                label="Catalog"
                value={catalogText}
                onChange={setCatalogText}
                resetValue={toPretty(defaults?.catalog ?? {})}
              />
            </TabsContent>
            <TabsContent value="navigation">
              <JsonEditor
                label="Navigation"
                value={navigationText}
                onChange={setNavigationText}
                resetValue={toPretty(defaults?.navigation ?? {})}
              />
            </TabsContent>
            <TabsContent value="featureFlags">
              <JsonEditor
                label="Feature Flags"
                value={featureFlagsText}
                onChange={setFeatureFlagsText}
                resetValue={toPretty(defaults?.featureFlags ?? {})}
              />
            </TabsContent>
          </Tabs>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleResetToDefaults}>
              Reset all to defaults
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Apply & Preview'}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The preview uses the Vite dev server and refreshes when you save changes. The admin API only accepts requests from
                localhost and optionally the configured token.
              </p>
              <div className="border rounded-md overflow-hidden bg-muted">
                <iframe
                  key={previewKey}
                  src={`/?preview=${previewKey}`}
                  title="Site preview"
                  className="w-full h-[480px] bg-background"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
