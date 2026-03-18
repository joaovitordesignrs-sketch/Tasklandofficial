function Icon() {
  return (
    <div className="relative shrink-0 size-[21.986px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9856 21.9856">
        <g id="Icon">
          <path d="M10.9928 4.58034V17.4053" id="Vector" stroke="var(--stroke-0, #0D1024)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29017" />
          <path d="M4.58034 10.9928H17.4053" id="Vector_2" stroke="var(--stroke-0, #0D1024)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29017" />
        </g>
      </svg>
    </div>
  );
}

export default function HomeScreen() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[14.993px] pr-[15.012px] py-[1.196px] relative rounded-[12px] size-full" data-name="HomeScreen" style={{ backgroundImage: "linear-gradient(135deg, rgb(227, 159, 100) 0%, rgb(192, 122, 63) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(255,255,255,0.15)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Icon />
    </div>
  );
}