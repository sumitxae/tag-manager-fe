"use client";

import { Building2, ArrowRightLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen h-screen px-4 ">
      <div className="navbar bg-base-100 shadow-sm border-b">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost normal-case text-xl font-bold">
            <Building2 className="w-6 h-6 mr-2" />
            Tag Markers
          </a>
        </div>
        <div className="flex-none">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center gap-10 md:flex-row md:px-16 lg:px-50">
        {/* Companies Card */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 rounded-3xl">
          <div className="card-body">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-xl">
              <Building2 className="w-8 h-8 text-primary" />
            </div>

            <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
              Company Management
            </h2>

            <p className="text-base-content/70 text-center mb-6">
              Create new companies or view existing ones. Manage your business
              entities with comprehensive tools and detailed insights.
            </p>

            <div className="card-actions flex flex-col gap-3">
              <button
                className="btn btn-primary btn-block rounded-2xl"
                onClick={() => {
                  router.push("/companies");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create or View Companies
              </button>
            </div>

            <div className="divider"></div>

            <div className="flex items-center justify-center text-sm text-base-content/60">
              <span>Quick access to all company features</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* EPC Generation Card */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 rounded-3xl ">
          <div className="card-body">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-xl">
              <ArrowRightLeft className="w-8 h-8 text-primary" />
            </div>

            <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
              EPC Generator
            </h2>

            <p className="text-base-content/70 text-center mb-6">
              Convert UPC codes to EPC format instantly. Generate electronic
              product codes for inventory management and supply chain tracking.
            </p>

            <div className="card-actions">
              <button
                className="btn btn-primary btn-block rounded-2xl "
                onClick={() => {
                  router.push("/epcgen");
                }}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2 " />
                Generate EPC from UPC
              </button>
            </div>

            <div className="divider"></div>

            <div className="flex items-center justify-center text-sm text-base-content/60">
              <span>Fast and accurate conversion</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
