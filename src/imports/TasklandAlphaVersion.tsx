import svgPaths from "./svg-zgx27tamml";
import imgImage from "figma:asset/40440db388cdb6300b83aa33d2c95692107c7496.png";
import imgE from "figma:asset/1bfbd496c9367f0ccae3d2da97754c3820ebada1.png";
import imgImage1 from "figma:asset/147b3ea044d17ccabc73d88e4f920ffa7c656903.png";
import imgImage2 from "figma:asset/681586ae7876c972dbcac054927d1990a9285862.png";

function Container1() {
  return <div className="absolute h-[851.905px] left-0 top-0 w-[1236.485px]" data-name="Container" />;
}

function Container2() {
  return <div className="absolute h-[851.905px] left-0 top-0 w-[1236.485px]" data-name="Container" />;
}

function Icon() {
  return (
    <div className="absolute left-[13.98px] size-[13.984px] top-[9.48px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1396)" id="Icon">
          <path d={svgPaths.p3d921900} id="Vector" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p54b58f0} id="Vector_2" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p2e54400} id="Vector_3" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p76a900} id="Vector_4" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1396">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[13.479px] left-[35.95px] top-[9.74px] w-[170.968px]" data-name="Text">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[13.5px] left-0 not-italic text-[9px] text-white top-[-0.8px] whitespace-nowrap">II – Golem de Pedra</p>
    </div>
  );
}

function Container8() {
  return <div className="bg-[#f0c040] h-[7.59px] shrink-0 w-full" data-name="Container" />;
}

function Container7() {
  return (
    <div className="bg-[rgba(0,0,0,0.6)] h-[9.983px] relative rounded-[5px] shrink-0 w-[139.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pl-[1.197px] pr-[128.978px] py-[1.196px] relative rounded-[inherit] size-full">
        <Container8 />
      </div>
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(240,192,64,0.33)] border-solid inset-0 pointer-events-none rounded-[5px]" />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20.995px] relative shrink-0 w-[51.991px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-full absolute font-['VT323:Regular',sans-serif] leading-[21px] left-[52.18px] not-italic text-[#f0c040] text-[14px] text-right top-[-0.41px] whitespace-nowrap">8/112 HP</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[5.982px] h-[20.995px] items-center left-[225.65px] top-[5.98px] w-[197.964px]" data-name="Container">
      <Container7 />
      <Text1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[#0b0d1e] h-[34.156px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1f254f] border-b-[1.196px] border-solid inset-0 pointer-events-none" />
      <Icon />
      <Text />
      <Container6 />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute h-[246.142px] left-0 top-0 w-[437.6px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function E() {
  return (
    <div className="flex-[1_0_0] h-[359.996px] min-h-px min-w-px relative" data-name="E">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgE} />
    </div>
  );
}

function TaskCharacter() {
  return (
    <div className="absolute content-stretch flex h-[209.218px] items-end left-[17.5px] top-[27.09px] w-[359.996px]" data-name="TaskCharacter">
      <E />
    </div>
  );
}

function Image1() {
  return (
    <div className="absolute left-[230.31px] size-[172.295px] top-[54.16px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImage1} />
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[246.142px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <Image />
      <TaskCharacter />
      <Image1 />
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#06ffa5] h-[6.992px] relative rounded-[3px] shrink-0 w-[17.985px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#06ffa5] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[#e39f64] h-[6.992px] relative rounded-[3px] shrink-0 w-[17.985px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e39f64] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-[#333] h-[6.992px] relative rounded-[3px] shrink-0 w-[17.985px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#2a2e50] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-[#1a1e37] h-[6.992px] relative rounded-[3px] shrink-0 w-[17.985px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#2a2e50] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#1a1e37] h-[6.992px] relative rounded-[3px] shrink-0 w-[17.985px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#2a2e50] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[6.992px] relative shrink-0 w-[105.852px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.982px] items-center relative size-full">
        <Container13 />
        <Container14 />
        <Container15 />
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[20.995px] relative shrink-0 w-[78.427px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['VT323:Regular',sans-serif] leading-[21px] left-0 not-italic text-[#5a6080] text-[14px] top-[-0.41px] whitespace-nowrap">1/5 derrotados</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[20.995px] relative shrink-0 w-[413.632px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container12 />
        <Text2 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#0b0d1e] h-[36.175px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1f254f] border-solid border-t-[1.196px] inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pl-[11.984px] pt-[8.188px] relative size-full">
        <Container11 />
      </div>
    </div>
  );
}

function ArenaCard() {
  return (
    <div className="bg-[#0d1024] h-[318.866px] relative rounded-[10px] shrink-0 w-[439.993px]" data-name="ArenaCard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip px-[1.197px] py-[1.196px] relative rounded-[inherit] size-full">
        <Container5 />
        <Container9 />
        <Container10 />
      </div>
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(42,46,80,0.7)] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[14.994px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-white top-[-0.61px] whitespace-nowrap">joa</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[13.479px] relative shrink-0 w-[45.018px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[13.5px] left-0 not-italic text-[#ffd700] text-[9px] top-[-0.8px] whitespace-nowrap">LVL 3</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[26.996px] relative shrink-0 w-[57.6px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['VT323:Regular',sans-serif] leading-[27px] left-0 not-italic text-[#8a9fba] text-[18px] top-[-1.41px] whitespace-nowrap">VETERANO</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[7.983px] h-[26.996px] items-center relative shrink-0 w-full" data-name="Container">
      <Text3 />
      <Text4 />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4.992px] h-[46.981px] items-start left-[67.98px] top-[4.51px] w-[337.655px]" data-name="Container">
      <Container21 />
      <Container22 />
    </div>
  );
}

function Image2() {
  return (
    <div className="h-[53.599px] relative shrink-0 w-full" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute bg-[#0b0d1e] left-0 rounded-[10px] size-[55.992px] top-0" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip pb-[1.196px] pl-[1.196px] pr-[1.197px] pt-[1.197px] relative rounded-[inherit] size-full">
        <Image2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1f254f] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[55.992px] left-[17.18px] top-[15.18px] w-[405.631px]" data-name="Container">
      <Container20 />
      <Container23 />
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[22.49px] relative shrink-0 w-[60.012px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['VT323:Regular',sans-serif] leading-[22.5px] left-0 not-italic text-[#8a7a6a] text-[15px] top-[-1.61px] whitespace-nowrap">5 / 200 XP</p>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[22.49px] relative shrink-0 w-[12.002px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['VT323:Regular',sans-serif] leading-[22.5px] left-0 not-italic text-[#ffd700] text-[15px] top-[-1.61px] whitespace-nowrap">3%</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex h-[22.49px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Text5 />
      <Text6 />
    </div>
  );
}

function Container27() {
  return <div className="absolute bg-[#ffd700] h-[7.59px] left-[1.2px] top-[1.2px] w-[12.096px]" data-name="Container" />;
}

function Container28() {
  return <div className="absolute h-[7.59px] left-[1.2px] top-[1.2px] w-[403.238px]" data-name="Container" />;
}

function Container26() {
  return (
    <div className="bg-[#0b0d1e] h-[9.983px] relative rounded-[5px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container27 />
        <Container28 />
      </div>
      <div aria-hidden="true" className="absolute border-[#2a2e50] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[5px]" />
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.982px] h-[36.456px] items-start left-[17.18px] top-[83.16px] w-[405.631px]" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.984px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1358)" id="Icon">
          <path d={svgPaths.pf295300} id="Vector" stroke="var(--stroke-0, #60A5FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1358">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[16.489px] relative shrink-0 w-[59.993px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#60a5fa] text-[11px] top-[-0.61px] tracking-[1px] whitespace-nowrap">3.350</p>
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[10.488px] relative shrink-0 w-[40.008px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[10.5px] left-0 not-italic text-[#5a6080] text-[7px] top-[-0.8px] tracking-[1px] whitespace-nowrap">POWER</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[16.489px] relative shrink-0 w-[125.95px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.982px] items-center relative size-full">
        <Icon1 />
        <Text7 />
        <Text8 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[12.002px] opacity-85 relative shrink-0 w-[8.002px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-0 not-italic text-[#60a5fa] text-[8px] top-[-0.8px] whitespace-nowrap">C</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute bg-[rgba(96,165,250,0.05)] content-stretch flex h-[30.847px] items-center justify-between left-[17.18px] px-[11.179px] py-[1.196px] rounded-[6px] top-[129.6px] w-[405.631px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(96,165,250,0.14)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container30 />
      <Text9 />
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-[#0d1024] h-[175.623px] relative rounded-[10px] shrink-0 w-[439.993px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(42,46,80,0.7)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container19 />
        <Container24 />
        <Container29 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g id="Icon">
          <path d={svgPaths.p17543000} id="Vector" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p10082a00} id="Vector_2" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p2476bb00} id="Vector_3" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p258ce580} id="Vector_4" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p2700ca00} id="Vector_5" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p35746f40} id="Vector_6" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p5410800} id="Vector_7" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p1afcce00} id="Vector_8" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(227,159,100,0.1)] h-[34.362px] relative rounded-[7px] shrink-0 w-[218.828px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#e39f64] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon2 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#e39f64] text-[8px] top-[10.38px] whitespace-nowrap">CAMPANHA</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1315)" id="Icon">
          <path d={svgPaths.p9d8ee00} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p35166c00} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p1e6ce400} id="Vector_3" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p3ffe9c00} id="Vector_4" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p27313e00} id="Vector_5" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p3b49bc80} id="Vector_6" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p30345580} id="Vector_7" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p2d89ac00} id="Vector_8" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p17b23100} id="Vector_9" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1315">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[34.362px] relative rounded-[7px] shrink-0 w-[218.828px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon3 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">FOCO</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-start relative">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1381)" id="Icon">
          <path d={svgPaths.p3f24dc00} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1381">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[34.362px] relative rounded-[7px] shrink-0 w-[218.828px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon4 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">HÁBITOS</p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1372)" id="Icon">
          <path d={svgPaths.p2521e030} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.pabc5d00} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1372">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[34.362px] relative rounded-[7px] shrink-0 w-[218.828px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon5 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">CONQUISTAS</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-start relative">
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1352)" id="Icon">
          <path d={svgPaths.p22ec2000} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p2fb0ea00} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1352">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[34.362px] relative rounded-[7px] shrink-0 w-[218.828px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon6 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">DIÁRIO</p>
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g id="Icon">
          <path d={svgPaths.p1a9df340} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d="M10.488 9.90536V5.24402" id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d="M7.57469 9.90536V2.91334" id="Vector_3" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d="M4.66135 9.90536V8.15736" id="Vector_4" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="flex-[1_0_0] h-[34.362px] min-h-px min-w-px relative rounded-[7px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon7 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">EVOLUÇÃO</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 w-[441.656px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-start relative w-full">
        <Button4 />
        <Button5 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g id="Icon">
          <path d={svgPaths.p1a9b3a80} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p21270400} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="flex-[1_0_0] h-[34.362px] min-h-px min-w-px relative rounded-[7px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon8 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">RENASCER</p>
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1342)" id="Icon">
          <path d={svgPaths.p84c4bc0} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.pe3518f0} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p3c920f00} id="Vector_3" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p183a9500} id="Vector_4" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1342">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="flex-[1_0_0] h-[34.362px] min-h-px min-w-px relative rounded-[7px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon9 />
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">AMIGOS</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 w-[441.656px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-start relative w-full">
        <Button6 />
        <Button7 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-[13.18px] size-[13.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1326)" id="Icon">
          <path d={svgPaths.p1c8bfb80} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p28c11d80} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1326">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[34.362px] relative rounded-[7px] shrink-0 w-[218.828px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1a1e37] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon10 />
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[12px] left-[37.15px] not-italic text-[#5a6080] text-[8px] top-[10.38px] whitespace-nowrap">CONFIG</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col gap-[3.982px] h-[341.113px] items-start relative shrink-0 w-full" data-name="Container">
      <Frame />
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Button8 />
    </div>
  );
}

function Container31() {
  return (
    <div className="relative shrink-0 w-[440px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pt-[9.983px] px-[9.983px] relative rounded-[inherit] w-full">
        <Container32 />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[20.995px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['VT323:Regular',sans-serif] leading-[21px] left-[109.71px] not-italic text-[#3a4060] text-[14px] text-center top-[-0.41px] whitespace-nowrap">@joa</p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="absolute left-[86.43px] size-[11.984px] top-[10.19px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9837 11.9837">
        <g id="Icon">
          <path d={svgPaths.p37ccf480} id="Vector" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.998638" />
          <path d={svgPaths.p23b0d80} id="Vector_2" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.998638" />
          <path d="M10.4857 5.99183H4.49387" id="Vector_3" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.998638" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="h-[32.361px] relative rounded-[7px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#2a2e50] border-[1.196px] border-solid inset-0 pointer-events-none rounded-[7px]" />
      <Icon11 />
      <p className="-translate-x-1/2 absolute font-['Press_Start_2P:Regular',sans-serif] leading-[10.5px] left-[118.89px] not-italic text-[#e63946] text-[7px] text-center top-[10.13px] whitespace-nowrap">{` SAIR`}</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[84.503px] relative shrink-0 w-[238.794px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1f254f] border-solid border-t-[1.196px] inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[5.982px] items-start pt-[11.18px] px-[9.983px] relative size-full">
        <Container34 />
        <Button9 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[819.936px] relative shrink-0 w-[439.993px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[9.983px] items-start overflow-clip relative rounded-[inherit] size-full">
        <ArenaCard />
        <Container18 />
        <Container31 />
        <Container33 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute left-[43.75px] size-[15.984px] top-[15.18px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9844 15.9844">
        <g clipPath="url(#clip0_38_1310)" id="Icon">
          <path d="M6.66018 1.33204H9.32425" id="Vector" stroke="var(--stroke-0, #FF6B35)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p28174980} id="Vector_2" stroke="var(--stroke-0, #FF6B35)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p13694e80} id="Vector_3" stroke="var(--stroke-0, #FF6B35)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
        </g>
        <defs>
          <clipPath id="clip0_38_1310">
            <rect fill="white" height="15.9844" width="15.9844" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChallengePanel() {
  return (
    <div className="bg-[rgba(255,107,53,0.09)] h-[46.346px] relative rounded-[8px] shrink-0 w-[366.277px]" data-name="ChallengePanel">
      <div aria-hidden="true" className="absolute border-[#ff6b35] border-[1.196px] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon12 />
        <p className="-translate-x-1/2 absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[196.21px] not-italic text-[#ff6b35] text-[10px] text-center top-[15.06px] tracking-[1px] whitespace-nowrap">{` ATIVAR DESAFIO TEMPORAL`}</p>
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="absolute left-[82.22px] size-[15.984px] top-[15.18px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9844 15.9844">
        <g clipPath="url(#clip0_38_1361)" id="Icon">
          <path d={svgPaths.p25ebde00} id="Vector" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.pb569100} id="Vector_2" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p14275400} id="Vector_3" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p2a54ae00} id="Vector_4" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p10ff96c0} id="Vector_5" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p165e3280} id="Vector_6" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p3bb433f0} id="Vector_7" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p309bd1c0} id="Vector_8" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
          <path d={svgPaths.p1e845c00} id="Vector_9" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33204" />
        </g>
        <defs>
          <clipPath id="clip0_38_1361">
            <rect fill="white" height="15.9844" width="15.9844" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function FocusPanel() {
  return (
    <div className="bg-[rgba(192,132,252,0.09)] h-[46.346px] relative rounded-[8px] shrink-0 w-[366.277px]" data-name="FocusPanel">
      <div aria-hidden="true" className="absolute border-[#c084fc] border-[1.196px] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon13 />
        <p className="-translate-x-1/2 absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[196.19px] not-italic text-[#c084fc] text-[10px] text-center top-[15.06px] tracking-[1px] whitespace-nowrap">{` ATIVAR MODO FOCO`}</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[54.328px] relative shrink-0 w-[740.537px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.983px] items-start pt-[7.983px] relative size-full">
        <ChallengePanel />
        <FocusPanel />
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="absolute left-0 size-[13.984px] top-[4.24px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_38_1306)" id="Icon">
          <path d={svgPaths.p18a62400} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p42a7cc0} id="Vector_2" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_38_1306">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute h-[22.49px] left-[13.98px] top-[15.67px] w-[108.937px]" data-name="Button">
      <Icon14 />
      <p className="-translate-x-1/2 absolute font-['VT323:Regular',sans-serif] leading-[22.5px] left-[64.48px] not-italic text-[#5a6080] text-[15px] text-center top-[-1.61px] whitespace-nowrap">Selecionar Tudo</p>
    </div>
  );
}

function Text10() {
  return (
    <div className="absolute h-[22.49px] left-[578.06px] top-[15.67px] w-[18.004px]" data-name="Text">
      <p className="absolute font-['VT323:Regular',sans-serif] leading-[22.5px] left-0 not-italic text-[#5a6080] text-[15px] top-[-1.61px] whitespace-nowrap">1/1</p>
    </div>
  );
}

function Icon15() {
  return (
    <div className="absolute left-[10.99px] size-[13.984px] top-[10.73px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g id="Icon">
          <path d="M2.91334 6.99202H11.0707" id="Vector" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d="M6.99202 2.91334V11.0707" id="Vector_2" stroke="var(--stroke-0, #E39F64)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="absolute bg-[rgba(227,159,100,0.12)] border-[#e39f64] border-[1.196px] border-dashed h-[37.858px] left-[606.04px] rounded-[6px] top-[7.98px] w-[118.117px]" data-name="Button">
      <Icon15 />
      <p className="-translate-x-1/2 absolute font-['VT323:Regular',sans-serif] leading-[25.5px] left-[66.97px] not-italic text-[#e39f64] text-[17px] text-center top-[4.58px] whitespace-nowrap">{` Nova Tarefa`}</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="bg-[#0b0d1e] h-[55.02px] relative shrink-0 w-[738.144px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1f254f] border-b-[1.196px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button10 />
        <Text10 />
        <Button11 />
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="h-[14.994px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[45.83%_58.33%_45.83%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.49893 2.49893">
            <path d={svgPaths.p2795ef80} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24947" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[33.33%] right-[58.33%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.49893 2.49893">
            <path d={svgPaths.p2795ef80} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24947" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[33.33%] right-[58.33%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.49893 2.49893">
            <path d={svgPaths.p2795ef80} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24947" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45.83%_33.33%_45.83%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.49893 2.49893">
            <path d={svgPaths.p2795ef80} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24947" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[58.33%] right-[33.33%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.49893 2.49893">
            <path d={svgPaths.p2795ef80} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24947" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[58.33%] right-[33.33%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.49893 2.49893">
            <path d={svgPaths.p2795ef80} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24947" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[50.963px] relative shrink-0 w-[18.976px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[3.982px] pt-[17.985px] relative size-full">
        <Icon16 />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[12.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9932 12.9932">
        <g id="Icon">
          <path d={svgPaths.p1831bf00} id="Vector" stroke="var(--stroke-0, #06FFA5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35346" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-[rgba(6,255,165,0.12)] relative rounded-[5px] shrink-0 size-[21.986px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(6,255,165,0.5)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[4.486px] pr-[4.505px] py-[1.196px] relative size-full">
        <Icon17 />
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="flex-[544.611_0_0] h-[40.457px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[text-decoration-skip-ink:none] absolute decoration-solid font-['VT323:Regular',sans-serif] leading-[28.5px] left-0 line-through not-italic text-[#4a5070] text-[19px] top-[5.57px] whitespace-nowrap">123</p>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[20.995px] relative shrink-0 w-[8.432px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['VT323:Regular','Noto_Sans_Symbols2:Regular',sans-serif] leading-[21px] left-0 not-italic text-[#06ffa5] text-[14px] top-[-0.41px] whitespace-nowrap">✓</p>
      </div>
    </div>
  );
}

function Icon18() {
  return (
    <div className="relative shrink-0 size-[12.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9932 12.9932">
        <g id="Icon">
          <path d={svgPaths.p1406f3b0} id="Vector" stroke="var(--stroke-0, #4A5070)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          <path d={svgPaths.p2ae78e00} id="Vector_2" stroke="var(--stroke-0, #4A5070)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="relative shrink-0 size-[20.957px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pl-[3.982px] pt-[3.982px] relative size-full">
        <Icon18 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[20.995px] relative shrink-0 w-[34.381px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4.992px] items-center relative size-full">
        <Text11 />
        <Button13 />
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="h-[12.993px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_8.33%_8.34%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9103 11.9102">
            <path d={svgPaths.p27b51800} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.83%_20.83%_62.5%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.2483 3.2483">
            <path d={svgPaths.p52b6f00} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="relative shrink-0 size-[28.959px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[7.983px] px-[7.983px] relative size-full">
        <Icon19 />
      </div>
    </div>
  );
}

function Icon20() {
  return (
    <div className="h-[12.993px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-3/4 left-[12.5%] right-[12.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-0.54px_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8277 1.08277">
            <path d="M0.541383 0.541383H10.2863" id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-[20.83%] right-[20.83%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-6.25%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.66213 9.74489">
            <path d={svgPaths.p2c7cf980} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.41383 3.2483">
            <path d={svgPaths.p1b4f6b60} id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45.83%_58.33%_29.17%_41.67%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-0.54px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.08277 4.33106">
            <path d="M0.541383 0.541383V3.78968" id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45.83%_41.67%_29.17%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-0.54px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.08277 4.33106">
            <path d="M0.541383 0.541383V3.78968" id="Vector" stroke="var(--stroke-0, #5A6080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08277" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="relative shrink-0 size-[28.959px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[7.983px] px-[7.983px] relative size-full">
        <Icon20 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[28.959px] relative shrink-0 w-[59.9px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[1.982px] items-center relative size-full">
        <Button14 />
        <Button15 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[55.992px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[7.983px] items-center px-[11.984px] relative size-full">
          <Container41 />
          <Button12 />
          <Container42 />
          <Container43 />
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function TaskItem() {
  return (
    <div className="bg-[rgba(78,222,128,0.04)] h-[57.189px] relative shrink-0 w-full" data-name="TaskItem">
      <div aria-hidden="true" className="absolute border-[rgba(6,255,165,0.25)] border-b-[1.196px] border-l-[2.393px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[1.196px] pl-[2.393px] relative size-full">
        <Container40 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="flex-[700.212_0_0] min-h-px min-w-px relative w-[738.144px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <TaskItem />
      </div>
    </div>
  );
}

function TaskList() {
  return (
    <div className="absolute bg-[#0d1024] h-[757.625px] left-0 rounded-[10px] top-0 w-[740.537px]" data-name="TaskList">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[1.196px] relative rounded-[inherit] size-full">
        <Container38 />
        <Container39 />
      </div>
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(42,46,80,0.8)] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Container37() {
  return (
    <div className="flex-[757.625_0_0] min-h-px min-w-px relative w-[740.537px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <TaskList />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="flex-[740.537_0_0] h-[819.936px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.983px] items-start overflow-clip relative rounded-[inherit] size-full">
        <Container36 />
        <Container37 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[15.984px] h-[851.905px] items-start left-0 overflow-clip pt-[15.984px] px-[19.985px] top-0 w-[1236.485px]" data-name="Container">
      <Container4 />
      <Container35 />
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="absolute bg-[#15182d] h-[851.905px] left-0 overflow-clip top-0 w-[1236.485px]" data-name="HomeScreen">
      <Container1 />
      <Container2 />
      <Container3 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[851.905px] left-0 top-0 w-[1236.485px]" data-name="Container">
      <HomeScreen />
    </div>
  );
}

function RootLayoutInner() {
  return (
    <div className="absolute bg-white h-[852px] left-0 top-0 w-[1236px]" data-name="RootLayoutInner">
      <Container />
    </div>
  );
}

export default function TasklandAlphaVersion() {
  return (
    <div className="bg-white relative size-full" data-name="Taskland Alpha version">
      <RootLayoutInner />
    </div>
  );
}