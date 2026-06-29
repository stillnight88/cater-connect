export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md">
                {/* App brand mark above each auth card */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        CaterConnect
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Professional catering management
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}