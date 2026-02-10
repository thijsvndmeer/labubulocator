import { LocateFixed, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const STARTUP_DURATION = 180 * 1000; // 3 minutes
const POLL_INTERVAL = 3000; // 3 seconds
const STORAGE_KEY = "backend_startup_progress";
const TIMESTAMP_KEY = "backend_startup_timestamp";

export const BackendStartupMessage = () => {
    const [progress, setProgress] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    // Initial load from storage
    useEffect(() => {
        const storedProgress = localStorage.getItem(STORAGE_KEY);
        const storedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

        if (storedProgress && storedTimestamp) {
            const elapsedSinceSave = Date.now() - parseInt(storedTimestamp, 10);
            // If saved less than 10 minutes ago, resume (otherwise start fresh)
            if (elapsedSinceSave < 10 * 60 * 1000) {
                // Approximate recovery: simple resume
                setProgress(parseFloat(storedProgress));
            } else {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TIMESTAMP_KEY);
            }
        }
    }, []);

    // Progress timer
    useEffect(() => {
        const intervalTime = 100;
        const steps = STARTUP_DURATION / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 100; // Cap at 100, wait for backend
                }
                const next = prev + increment;
                // Save state
                localStorage.setItem(STORAGE_KEY, next.toString());
                localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
                return next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, []);

    // Backend polling logic
    useEffect(() => {
        const checkBackend = async () => {
            setIsChecking(true);
            try {
                // Try a lightweight fetch
                await api.labubus.get();
                // If successful, backend is up!
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TIMESTAMP_KEY);
                window.location.reload();
            } catch (error) {
                // Still down, keep waiting
                console.log("Backend still warming up...", error);
            } finally {
                setIsChecking(false);
            }
        };

        const poller = setInterval(checkBackend, POLL_INTERVAL);
        // Run once immediately
        checkBackend();

        return () => clearInterval(poller);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-subtle p-4 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 space-y-8 border text-center relative overflow-hidden">
                {/* Subtle background decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />

                <div className="space-y-6">
                    {/* Logo Area */}
                    <div className="mx-auto w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center relative">
                        <LocateFixed className={`h-8 w-8 text-primary transition-opacity duration-300 ${isChecking ? 'opacity-50' : 'opacity-100'}`} />
                        {isChecking && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 text-primary animate-spin opacity-50 absolute" />
                            </div>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Warming Up Services
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The backend is spinning up from a cold start. <br />
                            This typically takes about 3 minutes.
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Initializing...</span>
                            <span>{Math.min(100, Math.round(progress))}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 transition-all duration-300" />
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-4 flex flex-col items-center gap-2">
                    <p className="text-xs text-muted-foreground animate-pulse">
                        {isChecking ? "Checking connection..." : "Waiting for service..."}
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        Manual Refresh
                    </Button>
                </div>
            </div>
        </div>
    );
};
