import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AdminConfig } from '@/types/admin-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ContentConfigEditor } from '@/components/admin/ContentConfigEditor';
import { ContentConfig, FeatureFlags, LayoutConfig, NavigationConfig, ThemeConfig, CatalogConfig } from '@/types/admin-config';
import { themeConfig as initialThemeConfig } from '@/config/theme.config';
import { layoutConfig as initialLayoutConfig } from '@/config/layout.config';
import { contentConfig as initialContentConfig } from '@/config/content.config';
import { catalogConfig as initialCatalogConfig } from '@/config/catalog.config';
import { navigationConfig as initialNavigationConfig } from '@/config/navigation.config';
import { featureFlags as initialFeatureFlags } from '@/config/feature-flags';
import { FeatureFlagsEditor } from '@/components/admin/FeatureFlagsEditor';
import { LayoutConfigEditor } from '@/components/admin/LayoutConfigEditor';
import { NavigationConfigEditor } from '@/components/admin/NavigationConfigEditor';
import { CatalogConfigEditor } from '@/components/admin/CatalogConfigEditor';
import { ThemeConfigEditor } from '@/components/admin/ThemeConfigEditor';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth'; // Import useAdminAuth

const AdminVariants = lazy(() => import('./AdminVariants')); // Lazy load AdminVariants

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

const Admin = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadedConfig, setLoadedConfig] = useState<AdminConfig | null>(null);
  const [defaults, setDefaults] = useState<AdminConfig | null>(null);
  const [themeText, setThemeText] = useState(() => toPretty(initialThemeConfig));
  const [contentText, setContentText] = useState(() => toPretty(initialContentConfig));
  const [layoutText, setLayoutText] = useState(() => toPretty(initialLayoutConfig));
  const [catalogText, setCatalogText] = useState(() => toPretty(initialCatalogConfig));
  const [navigationText, setNavigationText] = useState(() => toPretty(initialNavigationConfig));
  const [featureFlagsText, setFeatureFlagsText] = useState(() => toPretty(initialFeatureFlags));
  const [isSaving, setIsSaving] = useState(false);
  const [showUiContentEditor, setShowUiContentEditor] = useState(true);
  const [showUiFeatureFlagsEditor, setShowUiFeatureFlagsEditor] = useState(true);
  const [showUiLayoutEditor, setShowUiLayoutEditor] = useState(true);
  const [showUiNavigationEditor, setShowUiNavigationEditor] = useState(true);
  const [showUiCatalogEditor, setShowUiCatalogEditor] = useState(true);
  const [showUiThemeEditor, setShowUiThemeEditor] = useState(true);

  const { token, login, logout } = useAdminAuth(); // Use the logout function
  const [tokenInput, setTokenInput] = useState(token ?? '');
  const navigate = useNavigate(); // Import useNavigate

  const handleLogout = () => {
    logout();
    setTokenInput('');
    navigate('/'); // Navigate to a non-protected route to force re-evaluation
  };

  useEffect(() => {
    setTokenInput(token ?? '');
  }, [token]);

  const setEditorsFromConfig = (config: AdminConfig) => {
    setThemeText(toPretty(config.theme));
    setContentText(toPretty(config.content));
    setLayoutText(toPretty(config.layout));
    setCatalogText(toPretty(config.catalog));
    setNavigationText(toPretty(config.navigation));
    setFeatureFlagsText(toPretty(config.featureFlags));
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadConfig = async () => {
      try {
        const [configRes, defaultsRes] = await Promise.all([
          fetch('/admin-api/config', { headers: { 'x-admin-token': token } }),
          fetch('/admin-api/defaults', { headers: { 'x-admin-token': token } }),
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
  }, [token]);

  const parsedPayload = useMemo(() => {
    // If no config has been loaded yet, return null.
    // The UI should handle this by disabling save/preview buttons.
    if (!loadedConfig) return null;

    try {
      const parsedTheme = (() => { try { return JSON.parse(themeText) as ThemeConfig; } catch { return loadedConfig?.theme || initialThemeConfig; } })();
      const parsedContent = (() => { try { return JSON.parse(contentText) as ContentConfig; } catch { return loadedConfig?.content || initialContentConfig; } })();
      const parsedLayout = (() => { try { return JSON.parse(layoutText) as LayoutConfig; } catch { return loadedConfig?.layout || initialLayoutConfig; } })();
      const parsedCatalog = (() => { try { return JSON.parse(catalogText) as CatalogConfig; } catch { return loadedConfig?.catalog || initialCatalogConfig; } })();
      const parsedNavigation = (() => { try { return JSON.parse(navigationText) as NavigationConfig; } catch { return loadedConfig?.navigation || initialNavigationConfig; } })();
      const parsedFeatureFlags = (() => { try { return JSON.parse(featureFlagsText) as FeatureFlags; } catch { return loadedConfig?.featureFlags || initialFeatureFlags; } })();

      // Perform a more thorough structural validation to ensure all critical nested properties exist
      if (!parsedLayout || !parsedLayout.homepage || !Array.isArray(parsedLayout.homepage.carousels)) {
        throw new Error("Layout configuration is invalid or incomplete (homepage.carousels missing).");
      }
      if (!parsedContent || !parsedContent.hero || !parsedContent.footer) {
        throw new Error("Content configuration is invalid or incomplete (hero or footer missing).");
      }
      // Add more checks for other critical sections as needed

      return {
        theme: parsedTheme,
        content: parsedContent,
        layout: parsedLayout,
        catalog: parsedCatalog,
        navigation: parsedNavigation,
        featureFlags: parsedFeatureFlags,
      } as AdminConfig;
    } catch (error) {
      console.error("Admin: Error parsing or validating payload:", error);
      return error as Error;
    }
  }, [themeText, contentText, layoutText, catalogText, navigationText, featureFlagsText, loadedConfig,
    initialThemeConfig, initialContentConfig, initialLayoutConfig, initialCatalogConfig, initialNavigationConfig, initialFeatureFlags // Add initial configs to dependencies
  ]);

  // New useEffect for live preview updates
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && parsedPayload && !(parsedPayload instanceof Error)) {
      iframeRef.current.contentWindow.postMessage(parsedPayload, window.location.origin);
    }
  }, [parsedPayload]); // Depend on parsedPayload to trigger updates

  const handleSaveOnly = async () => {
    if (!token) {
      toast.error('Admin token required before saving.');
      return;
    }

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
      toast.success('Configuration saved.');
    } catch (error) {
      console.error("Admin: Error during handleSaveOnly:", error);
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };



  const handleLoadDefaults = () => {
    if (!defaults) {
      toast.error("Default configuration not loaded.");
      console.error("Admin: Defaults not loaded when handleLoadDefaults called.");
      return;
    }
    setEditorsFromConfig(defaults);
    toast.info("Defaults loaded into editors. You can now preview or save them.");
  };

  const handleReset = () => {
    if (!loadedConfig) {
      toast.error("No configuration loaded yet.");
      console.error("Admin: No loadedConfig available when handleReset called.");
      return;
    }
    setEditorsFromConfig(loadedConfig);
    toast.info("Changes have been reset to the last saved state.");
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
            value={tokenInput}
            onChange={(e) => {
              const newValue = e.target.value;
              setTokenInput(newValue);
              if (newValue) {
                login(newValue);
              } else {
                logout();
              }
            }}
            placeholder="Provide ADMIN_TOKEN if set"
            className="min-w-[240px]"
          />
          <Button onClick={logout} variant="outline" className="min-w-[80px]">
            Logout
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-4">
          <Tabs defaultValue="theme" className="space-y-4">
            <TabsList className="w-full flex flex-wrap">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="content">Copy</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="catalog">Catalog</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="featureFlags">Feature Flags</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            <TabsContent value="theme">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="toggle-theme-editor"
                  checked={showUiThemeEditor}
                  onCheckedChange={setShowUiThemeEditor}
                />
                <Label htmlFor="toggle-theme-editor">Show UI Editor</Label>
              </div>
              {showUiThemeEditor ? (
                <ThemeConfigEditor
                  value={(() => {
                    try {
                      return JSON.parse(themeText) as ThemeConfig;
                    } catch {
                      return loadedConfig?.theme || initialThemeConfig;
                    }
                  })()}
                  onChange={(newConfig) => setThemeText(toPretty(newConfig))}
                />
              ) : (
                <JsonEditor
                  label="Theme"
                  value={themeText}
                  onChange={setThemeText}
                  resetValue={toPretty(loadedConfig?.theme ?? {})}
                />
              )}
            </TabsContent>
            <TabsContent value="content">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="toggle-content-editor"
                  checked={showUiContentEditor}
                  onCheckedChange={setShowUiContentEditor}
                />
                <Label htmlFor="toggle-content-editor">Show UI Editor</Label>
              </div>
              {showUiContentEditor ? (
                <ContentConfigEditor
                  value={(() => {
                    try {
                      return JSON.parse(contentText) as ContentConfig;
                    } catch {
                      return loadedConfig?.content || initialContentConfig;
                    }
                  })()}
                  onChange={(newConfig) => setContentText(toPretty(newConfig))}
                />
              ) : (
                <JsonEditor
                  label="Copy"
                  value={contentText}
                  onChange={setContentText}
                  resetValue={toPretty(loadedConfig?.content ?? {})}
                />
              )}
            </TabsContent>
            <TabsContent value="layout">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="toggle-layout-editor"
                  checked={showUiLayoutEditor}
                  onCheckedChange={setShowUiLayoutEditor}
                />
                <Label htmlFor="toggle-layout-editor">Show UI Editor</Label>
              </div>
              {showUiLayoutEditor ? (
                <LayoutConfigEditor
                  value={(() => {
                    try {
                      return JSON.parse(layoutText) as LayoutConfig;
                    } catch {
                      return loadedConfig?.layout || initialLayoutConfig;
                    }
                  })()}
                  onChange={(newConfig) => setLayoutText(toPretty(newConfig))}
                />
              ) : (
                <JsonEditor
                  label="Layout"
                  value={layoutText}
                  onChange={setLayoutText}
                  resetValue={toPretty(loadedConfig?.layout ?? {})}
                />
              )}
            </TabsContent>
            <TabsContent value="catalog">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="toggle-catalog-editor"
                  checked={showUiCatalogEditor}
                  onCheckedChange={setShowUiCatalogEditor}
                />
                <Label htmlFor="toggle-catalog-editor">Show UI Editor</Label>
              </div>
              {showUiCatalogEditor ? (
                <CatalogConfigEditor
                  value={(() => {
                    try {
                      return JSON.parse(catalogText) as CatalogConfig;
                    } catch {
                      return loadedConfig?.catalog || initialCatalogConfig;
                    }
                  })()}
                  onChange={(newConfig) => setCatalogText(toPretty(newConfig))}
                />
              ) : (
                <JsonEditor
                  label="Catalog"
                  value={catalogText}
                  onChange={setCatalogText}
                  resetValue={toPretty(loadedConfig?.catalog ?? {})}
                />
              )}
            </TabsContent>
            <TabsContent value="navigation">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="toggle-navigation-editor"
                  checked={showUiNavigationEditor}
                  onCheckedChange={setShowUiNavigationEditor}
                />
                <Label htmlFor="toggle-navigation-editor">Show UI Editor</Label>
              </div>
              {showUiNavigationEditor ? (
                <NavigationConfigEditor
                  value={(() => {
                    try {
                      return JSON.parse(navigationText) as NavigationConfig;
                    } catch {
                      return loadedConfig?.navigation || initialNavigationConfig;
                    }
                  })()}
                  onChange={(newConfig) => setNavigationText(toPretty(newConfig))}
                />
              ) : (
                <JsonEditor
                  label="Navigation"
                  value={navigationText}
                  onChange={setNavigationText}
                  resetValue={toPretty(loadedConfig?.navigation ?? {})}
                />
              )}
            </TabsContent>
            <TabsContent value="featureFlags">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="toggle-featureflags-editor"
                  checked={showUiFeatureFlagsEditor}
                  onCheckedChange={setShowUiFeatureFlagsEditor}
                />
                <Label htmlFor="toggle-featureflags-editor">Show UI Editor</Label>
              </div>
              {showUiFeatureFlagsEditor ? (
                <FeatureFlagsEditor
                  value={(() => {
                    try {
                      return JSON.parse(featureFlagsText) as FeatureFlags;
                    } catch {
                      return loadedConfig?.featureFlags || initialFeatureFlags;
                    }
                  })()}
                  onChange={(newConfig) => setFeatureFlagsText(toPretty(newConfig))}
                />
              ) : (
                <JsonEditor
                  label="Feature Flags"
                  value={featureFlagsText}
                  onChange={setFeatureFlagsText}
                  resetValue={toPretty(loadedConfig?.featureFlags ?? {})}
                />
              )}
            </TabsContent>
            <TabsContent value="variants">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminVariants />
              </Suspense>
            </TabsContent>
          </Tabs>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={handleLoadDefaults}>
              Load Defaults
            </Button>
            <Button variant="outline" onClick={handleSaveOnly} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        <div className="space-y-4">
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
                  ref={iframeRef}
                  src={`/`}
                  title="Site preview"
                  className="w-full h-[80vh] bg-background"
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
