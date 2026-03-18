import svgPaths from "./svg-1jfxkqrmxt";
import imgArenaBackground1 from "figma:asset/6037587fea6349ebacca46bf46244c717b2e23e6.png";
import imgE from "figma:asset/329c293a854a6d5b4964bb77f8e54fa123e247df.png";
import imgImage from "figma:asset/147b3ea044d17ccabc73d88e4f920ffa7c656903.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.984px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.984 13.984">
        <g clipPath="url(#clip0_43_559)" id="Icon">
          <path d={svgPaths.p3d921900} id="Vector" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p54b58f0} id="Vector_2" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p2e54400} id="Vector_3" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
          <path d={svgPaths.p76a900} id="Vector_4" stroke="var(--stroke-0, #E63946)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16534" />
        </g>
        <defs>
          <clipPath id="clip0_43_559">
            <rect fill="white" height="13.984" width="13.984" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="flex-[301.723_0_0] h-[13.479px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[13.5px] left-0 not-italic text-[9px] text-white top-[-0.8px] whitespace-nowrap">II – Golem de Pedra</p>
      </div>
    </div>
  );
}

function Container3() {
  return <div className="bg-[#e63946] h-[7.59px] shrink-0 w-full" data-name="Container" />;
}

function Container2() {
  return (
    <div className="bg-[rgba(0,0,0,0.6)] h-[9.983px] relative rounded-[5px] shrink-0 w-[119.986px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pl-[1.197px] pr-[1.196px] py-[1.196px] relative rounded-[inherit] size-full">
        <Container3 />
      </div>
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(230,57,70,0.33)] border-solid inset-0 pointer-events-none rounded-[5px]" />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[19.48px] relative shrink-0 w-[51.991px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-full absolute font-['VT323:Regular',sans-serif] leading-[19.5px] left-[52px] not-italic text-[#e63946] text-[13px] text-right top-[-1.61px] whitespace-nowrap">112/112 HP</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[19.48px] relative shrink-0 w-[177.96px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.982px] items-center relative size-full">
        <Container2 />
        <Text1 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[#0b0d1e] h-[32.642px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1f254f] border-b-[1.196px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[7.983px] items-center pb-[1.196px] px-[13.984px] relative size-full">
          <Icon />
          <Text />
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return <div className="absolute h-[302.396px] left-0 top-0 w-[537.6px]" data-name="Container" />;
}

function Container6() {
  return <div className="absolute h-[1.982px] left-0 top-[245.99px] w-[537.6px]" data-name="Container" style={{ backgroundImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(42, 46, 80, 0.6) 20%, rgba(42, 46, 80, 0.6) 80%, rgba(0, 0, 0, 0) 100%)" }} />;
}

function E() {
  return (
    <div className="flex-[1_0_0] h-[439.195px] min-h-px min-w-px relative" data-name="E">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgE} />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[439.2px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-end relative size-full">
        <E />
      </div>
    </div>
  );
}

function TaskCharacter() {
  return (
    <div className="absolute content-stretch flex h-[257.022px] items-end left-[21.5px] px-[-39.6px] top-[33.28px] w-[359.996px]" data-name="TaskCharacter">
      <Container7 />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute left-[282.93px] size-[211.668px] top-[66.54px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-gradient-to-b from-[#0a0c1a] h-[302.396px] overflow-clip relative shrink-0 to-[#111428] via-[#0d1024] via-[60%] w-full" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[352px] left-[calc(50%+1.46px)] top-[calc(50%+24.98px)] w-[630px]" data-name="arena_background_1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgArenaBackground1} />
      </div>
      <Container5 />
      <Container6 />
      <TaskCharacter />
      <Image />
    </div>
  );
}

function Container11() {
  return <div className="absolute bg-[#06ffa5] border-[#06ffa5] border-[1.196px] border-solid h-[6.992px] left-0 rounded-[3px] top-0 w-[15.984px]" data-name="Container" />;
}

function Container12() {
  return <div className="absolute bg-[#e39f64] border-[#e39f64] border-[1.196px] border-solid h-[6.992px] left-[19.97px] rounded-[3px] top-0 w-[15.984px]" data-name="Container" />;
}

function Container13() {
  return <div className="absolute bg-[#1a1e37] border-[#2a2e50] border-[1.196px] border-solid h-[6.992px] left-[39.93px] rounded-[3px] top-0 w-[15.984px]" data-name="Container" />;
}

function Container14() {
  return <div className="absolute bg-[#1a1e37] border-[#2a2e50] border-[1.196px] border-solid h-[6.992px] left-[59.9px] rounded-[3px] top-0 w-[15.984px]" data-name="Container" />;
}

function Container15() {
  return <div className="absolute bg-[#1a1e37] border-[#2a2e50] border-[1.196px] border-solid h-[6.992px] left-[79.87px] rounded-[3px] top-0 w-[15.984px]" data-name="Container" />;
}

function Container10() {
  return (
    <div className="h-[6.992px] relative shrink-0 w-[95.851px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container11 />
        <Container12 />
        <Container13 />
        <Container14 />
        <Container15 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[10.488px] relative shrink-0 w-[44.999px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[10.5px] left-0 not-italic text-[#3a4060] text-[7px] top-[-0.8px] tracking-[0.5px] whitespace-nowrap">NORMAL</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[10.488px] relative shrink-0 w-[513.633px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container10 />
        <Text2 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-[#0b0d1e] h-[25.669px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1f254f] border-solid border-t-[1.196px] inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pl-[11.984px] pt-[8.188px] relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

export default function ArenaCard() {
  return (
    <div className="bg-[#0d1024] relative rounded-[10px] size-full" data-name="ArenaCard">
      <div className="content-stretch flex flex-col items-start overflow-clip px-[1.197px] py-[1.196px] relative rounded-[inherit] size-full">
        <Container />
        <Container4 />
        <Container8 />
      </div>
      <div aria-hidden="true" className="absolute border-[1.196px] border-[rgba(42,46,80,0.7)] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}