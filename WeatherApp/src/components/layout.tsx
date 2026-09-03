import type { PropsWithChildren } from "react";
import Header from "./header";

const Layout = ({ children }: PropsWithChildren) => {
    return (
        <div className="bg-gradient-to-br from-background to-muted">
            <Header />
            <main className="min-h-screen container mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="border-t backdrop-blur">
                <div className="container mx-auto px-4 py-12 text-center text-gray-400
                supports-[backdrop-filter]:bg-background/60">
                    <p>
                        Made By Pontusdemon
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Layout