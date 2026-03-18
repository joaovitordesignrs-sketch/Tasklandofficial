import imgFreepikTile1498912 from "figma:asset/1b10dd2b5d01c33f1c114612aff555e40d9f2663.png";

function Frame() {
  return (
    <div className="bg-[#0d1024] relative shrink-0 size-[64px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 absolute aspect-[826/834] bottom-[-97.48%] flex items-center justify-center left-[calc(50%-1px)] top-[-33.89%]">
          <div className="-scale-y-100 flex-none h-[148.078px] rotate-180 w-[146.658px]">
            <div className="relative size-full" data-name="freepik__tile-1__49891 2">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFreepikTile1498912} />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#1f254f] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[16.489px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-white top-[-0.61px] whitespace-nowrap">Aventureiro</p>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[14.994px] relative shrink-0 w-[49.972px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#ffd700] text-[10px] top-[-0.61px] whitespace-nowrap">LVL 2</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-[38.4px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['VT323:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#8a7a6a] text-[16px] top-[-0.41px] whitespace-nowrap">NOVATO</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[7.983px] h-[24.005px] items-center relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] h-[44.476px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.982px] items-start relative size-full">
        <Container2 />
        <Container3 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[13.984px] items-center relative size-full" data-name="Container">
      <Frame />
      <Container1 />
    </div>
  );
}