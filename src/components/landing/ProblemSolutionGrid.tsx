import { CheckCircle2, PackageX, Radio, ScanLine } from "lucide-react";

export function ProblemSolutionGrid() {
    const problems = [
        {
            title: "Stop Medicine Stockouts",
            description: "No more empty shelves. Real-time inventory tracking prevents critical shortages before they happen.",
            icon: <PackageX className="h-8 w-8 text-destructive" />,
            solution: "Real-time AI Tracking"
        },
        {
            title: "Unified Communication",
            description: "Break the silos. Connect pharmacists, remote doctors, and patients in one seamless loop.",
            icon: <Radio className="h-8 w-8 text-primary" />,
            solution: "Seamless Connection"
        },
        {
            title: "Automated Tracking",
            description: "Eliminate manual errors. AI-driven record keeping ensures patient history is accurate and secure.",
            icon: <ScanLine className="h-8 w-8 text-sage-green-600" />, // adjusting color usage in component logic if needed, but sage-green is defined in css variable
            solution: "Error-free Records"
        }
    ];

    return (
        <section id="solutions" className="py-24 bg-gradient-to-b from-medical-blue/20 to-background relative overflow-hidden">
            {/* Subtle floating background elements */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-sage-green/10 rounded-full blur-3xl"></div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-dark-blue">Challenges & Solutions</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We identify the bottlenecks in rural medicine delivery and solve them with intuitive technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((item, index) => (
                        <div key={index} className="flex flex-col p-8 rounded-[30px] liquid-card liquid-card-hover">
                            <div className="mb-6 p-4 rounded-2xl bg-white/40 w-fit shadow-sm backdrop-blur-md">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-dark-blue">{item.title}</h3>
                            <p className="text-muted-foreground flex-grow mb-6 leading-relaxed">{item.description}</p>
                            <div className="flex items-center text-sm font-semibold text-primary mt-auto bg-white/30 w-fit px-4 py-2 rounded-full border border-white/40">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {item.solution}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
