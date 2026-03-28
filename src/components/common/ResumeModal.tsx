// Common Resume Modal Component - shared across all director pages
const ResumeModal = () => (
  <div className="p-16 md:p-24 max-h-[70vh] overflow-y-auto overflow-x-hidden">
    {/* Header */}
    <div className="text-center mb-24 pb-20 border-b border-gray-200">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Insu Choi</h2>
      <p className="text-sm text-gray-600"><span className="font-bold">Assistant Professor</span>, Gachon University</p>
      <p className="text-sm text-gray-600"><span className="font-bold">Director</span>, FINDS Lab</p>
      <p className="text-sm text-gray-600"><span className="font-bold">Director</span>, JL Creatives & Contents</p>
    </div>

    {/* Academic Positions */}
    <section className="mb-20">
      <h3 className="text-sm font-bold text-primary mb-12">Academic Positions</h3>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16">
          <div className="min-w-0 flex-1 md:pr-12">
            <p className="text-xs font-semibold text-gray-900"><span className="font-bold">Assistant Professor</span>, Gachon University</p>
            <p className="text-xs text-gray-500">Big Data Business Management Major, Department of Finance & Big Data, College of Business</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2026-03 – Present</span>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16">
          <div className="min-w-0 flex-1 md:pr-12">
            <p className="text-xs font-semibold text-gray-900"><span className="font-bold">Assistant Professor</span>, Dongduk Women's University</p>
            <p className="text-xs text-gray-500">Division of Business Administration, College of Business</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2025-09 – 2026-02</span>
        </div>
      </div>
    </section>

    {/* Research Interests */}
    <section className="mb-20">
      <h3 className="text-sm font-bold text-primary mb-12">Research Interests</h3>
      <ul className="text-xs text-gray-700 space-y-4 ml-12">
        <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" /><span className="font-bold">Financial Data Science</span></li>
        <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" /><span className="font-bold">Business Analytics</span></li>
        <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" /><span className="font-bold">Data-Informed Decision Making</span></li>
      </ul>
    </section>

    {/* Education */}
    <section className="mb-20">
      <h3 className="text-sm font-bold text-primary mb-12">Education</h3>
      <div className="space-y-12">
        <div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16 mb-4">
            <p className="text-xs font-semibold text-gray-900 min-w-0 flex-1 md:pr-12">Ph.D., Industrial and Systems Engineering, KAIST</p>
            <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2025-02</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-3 ml-12 pr-8">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" /><span>Best Doctoral Dissertation Award, Korean Operations Research and Management Science Society (KORMS)</span></li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Advisor: Prof. Woo Chang Kim</li>
          </ul>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16 mb-4">
            <p className="text-xs font-semibold text-gray-900 min-w-0 flex-1 md:pr-12">M.S., Industrial and Systems Engineering, KAIST</p>
            <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2021-02</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Best Master Thesis Award, Korean Institute of Industrial Engineers (KIIE)</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Advisor: Prof. Woo Chang Kim</li>
          </ul>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16 mb-4">
            <p className="text-xs font-semibold text-gray-900 min-w-0 flex-1 md:pr-12">B.E., Industrial and Management Systems Engineering, Kyung Hee University</p>
            <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2018-02</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Valedictorian, College of Engineering (4.42 GPA on a 4.5 scale)</li>
          </ul>
        </div>
      </div>
    </section>

    {/* Selected Publications */}
    <section className="mb-20">
      <h3 className="text-sm font-bold text-primary mb-12">Selected Publications</h3>
      <p className="text-xs text-gray-600 mb-8">20+ peer-reviewed journal articles published in SSCI/SCIE indexed journals. Representative journals include:</p>
      <ul className="text-xs text-gray-600 space-y-6 ml-12">
        <li className="flex items-start gap-6">
          <span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />
          <span>
            <strong>International Review of Financial Analysis</strong>
            <span className="block md:inline text-gray-400 md:ml-4">[SSCI, Top 2.4% as of 2024]</span>
          </span>
        </li>
        <li className="flex items-start gap-6">
          <span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />
          <span>
            <strong>Engineering Applications of Artificial Intelligence</strong>
            <span className="block md:inline text-gray-400 md:ml-4">[SCIE, Top 2.5% as of 2024]</span>
          </span>
        </li>
        <li className="flex items-start gap-6">
          <span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />
          <span>
            <strong>Research in International Business and Finance</strong>
            <span className="block md:inline text-gray-400 md:ml-4">[SSCI, Top 4.5% as of 2023]</span>
          </span>
        </li>
        <li className="flex items-start gap-6">
          <span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />
          <span>
            <strong>International Review of Economics & Finance</strong>
            <span className="block md:inline text-gray-400 md:ml-4">[SSCI, Top 9.6% as of 2024]</span>
          </span>
        </li>
        <li className="flex items-start gap-6">
          <span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />
          <span>
            <strong>Knowledge-Based Systems</strong>
            <span className="block md:inline text-gray-400 md:ml-4">[SCIE, Top 13.5% as of 2024]</span>
          </span>
        </li>
      </ul>
    </section>

    {/* Selected Research Projects */}
    <section className="mb-20">
      <h3 className="text-sm font-bold text-primary mb-12">Selected Research Projects</h3>
      <div className="space-y-12">
        <div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16 mb-4">
            <p className="text-xs font-semibold text-gray-900 min-w-0 flex-1 md:pr-12">Portfolio Risk Assessment and Investment Transparency with Explainable AI</p>
            <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2025-05 – 2025-09</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Principal Investigator</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Funded by <strong className="text-gray-700">Korea Institute of Public Finance</strong></li>
          </ul>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16 mb-4">
            <p className="text-xs font-semibold text-gray-900 min-w-0 flex-1 md:pr-12">An Analysis of the Capacity Enhancement Effect of Domestic Asset Management Companies via the Bank of Korea's Consignment of Foreign Currency Asset Management</p>
            <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2023-11 – 2024-07</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Lead Researcher</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Funded by <strong className="text-gray-700">Bank of Korea</strong></li>
          </ul>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-16 mb-4">
            <p className="text-xs font-semibold text-gray-900 min-w-0 flex-1 md:pr-12">Financial Data-Driven Market Valuation Model</p>
            <span className="text-xs text-gray-400 shrink-0 md:w-[140px] md:text-right">2021-08 – 2023-12</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Lead Researcher</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Funded by <strong className="text-gray-700">Shinhan Bank</strong></li>
          </ul>
        </div>
      </div>
    </section>

    {/* Professional Service */}
    <section className="mb-20">
      <h3 className="text-sm font-bold text-primary mb-12">Professional Service</h3>
      <p className="text-xs text-gray-600">
        <strong>Reviewer:</strong> International Review of Financial Analysis, Finance Research Letters, Knowledge-Based Systems, Machine Learning with Applications, Annals of Operations Research, and 40+ journals
      </p>
    </section>

    {/* Teaching Experience */}
    <section>
      <h3 className="text-sm font-bold text-primary mb-12">Teaching Experience</h3>
      <div className="space-y-12">
        <div>
          <p className="text-xs font-bold text-gray-900 mb-6">Gachon University <span className="font-normal text-gray-500">(2026-03 – Present)</span></p>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Financial Investment</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Business Intelligence and Analytics</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 mb-6">Dongduk Women's University <span className="font-normal text-gray-500">(2025-09 – 2026-02)</span></p>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Business Decision Making and Data Analysis</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Python Programming</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 mb-6">Korea University Sejong Campus <span className="font-normal text-gray-500">(2025-03 – 2026-02)</span></p>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Algorithmic Trading</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 mb-6">Kangnam University <span className="font-normal text-gray-500">(2025-03 – 2026-02)</span></p>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Introduction to Financial Engineering</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Applied Statistics</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 mb-6">Kyung Hee University <span className="font-normal text-gray-500">(2024-03 – 2024-08)</span></p>
          <ul className="text-xs text-gray-600 space-y-3 ml-12">
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Financial Engineering</li>
            <li className="flex items-start gap-6"><span className="w-3 h-3 rounded-full bg-primary/30 shrink-0 mt-5" />Engineering Economy</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
)

export default ResumeModal
