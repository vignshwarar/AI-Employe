const screenWidth: number = window.screen.width;
const screenHeight: number = window.screen.height;
const boxWidth: number = screenWidth / 4;
const boxHeight: number = screenHeight / 4;

interface BlockPosition {
  minXRange: number;
  maxXRange: number;
  minYRange: number;
  maxYRange: number;
}

interface BlockCoordinates {
  x: number;
  y: number;
  blockId: string;
}

const blockIds: string[][] = [
  ["A1", "A2", "A3", "A4"],
  ["B1", "B2", "B3", "B4"],
  ["C1", "C2", "C3", "C4"],
  ["D1", "D2", "D3", "D4"],
];

function injectBlock({ x, y, blockId }: BlockCoordinates) {
  const block: HTMLDivElement = document.createElement("div");
  Object.assign(block.style, {
    width: `${boxWidth}px`,
    height: `${boxHeight}px`,
    position: "fixed",
    // border: "1px solid red", // uncomment to see the blocks
    zIndex: "999999",
    top: `${y}px`,
    left: `${x}px`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    pointerEvents: "none",
  });
  block.id = `aie-blockId-${blockId}`;
  // block.innerHTML = `<p style="background:yellow;color:black">${blockId}</p>`; // uncomment to see the blocks
  document.body.appendChild(block);
}

function debounce(
  func: (...args: any[]) => void,
  wait: number,
  immediate?: boolean
): (...args: any[]) => void {
  let timeout: number | undefined;
  return function (this: any, ...args: any[]) {
    const context = this;
    const later = function () {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout as number);
    timeout = window.setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

async function calculateBlockPositions(
  blockIds: string[][]
): Promise<Record<string, BlockPosition>> {
  const preCalculated: Record<string, BlockPosition> = {};
  blockIds.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      const blockElm: HTMLElement | null = document.getElementById(
        `aie-blockId-${col}`
      );
      if (blockElm) {
        const blockElmRect: DOMRect = blockElm.getBoundingClientRect();
        preCalculated[col] = {
          minXRange: blockElmRect.x,
          maxXRange: blockElmRect.x + blockElmRect.width,
          minYRange: blockElmRect.y,
          maxYRange: blockElmRect.y + blockElmRect.height,
        };
      }
    });
  });

  return preCalculated;
}

async function assignBlockIdsToElements(
  preCalculated: Record<string, BlockPosition>
): Promise<void> {
  document.querySelectorAll("*").forEach((el) => {
    const elRect: DOMRect = el.getBoundingClientRect();
    for (const [key, value] of Object.entries(preCalculated)) {
      if (
        elRect.x >= value.minXRange &&
        elRect.x <= value.maxXRange &&
        elRect.y >= value.minYRange &&
        elRect.y <= value.maxYRange
      ) {
        const blockIdArray: string[] = (el.getAttribute("aie-block-ids") || "")
          .split(",")
          .filter(Boolean);
        if (!blockIdArray.includes(key)) {
          blockIdArray.push(key);
          el.setAttribute("aie-block-ids", blockIdArray.join(","));
        }
      }
    }
  });
}

async function assignIds(): Promise<void> {
  document.querySelectorAll("*").forEach((el, i) => {
    if (!el.getAttribute("aie-id") && !el.id.startsWith("aie-blockId")) {
      el.setAttribute("aie-id", `${i}`);
    }
  });
}

const recalculateBlockPositions: (...args: any[]) => void = debounce(
  async (e: Event) => {
    const preCalculated: Record<string, BlockPosition> =
      await calculateBlockPositions(blockIds);
    await assignBlockIdsToElements(preCalculated);
    await assignIds();
  },
  500
);

const blockPositionChangeEventList = [
  "scroll",
  "resize",
  "click",
  "input",
] as const;

async function executeBlockInjectionAndAssignment(): Promise<void> {
  blockIds.forEach((row, i) => {
    row.forEach((col, j) => {
      injectBlock({
        x: i * boxWidth,
        y: j * boxHeight,
        blockId: col,
      });
    });
  });

  const preCalculated: Record<string, BlockPosition> =
    await calculateBlockPositions(blockIds);

  await assignBlockIdsToElements(preCalculated);

  await assignIds();

  blockPositionChangeEventList.forEach((event) => {
    window.addEventListener(event, recalculateBlockPositions);
  });
}

export { executeBlockInjectionAndAssignment, recalculateBlockPositions };
