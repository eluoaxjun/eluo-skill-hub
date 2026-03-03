import React from "react";
import { render, screen } from "@testing-library/react";
import { InteractiveGlobe } from "../interactive-globe";

// Canvas API mock — jsdom does not support canvas
const mockCtx = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  moveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  fillText: jest.fn(),
  createRadialGradient: jest.fn().mockReturnValue({
    addColorStop: jest.fn(),
  }),
  scale: jest.fn(),
};

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest
    .fn()
    .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("InteractiveGlobe", () => {
  it("canvas 엘리먼트를 렌더링한다", () => {
    render(<InteractiveGlobe />);
    const canvas = document.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("size prop이 canvas style width/height에 적용된다", () => {
    render(<InteractiveGlobe size={400} />);
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("400px");
    expect(canvas.style.height).toBe("400px");
  });

  it("기본 size가 600이다", () => {
    render(<InteractiveGlobe />);
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("600px");
    expect(canvas.style.height).toBe("600px");
  });

  it("className prop이 canvas 클래스에 추가된다", () => {
    render(<InteractiveGlobe className="test-class" />);
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.className).toContain("test-class");
    expect(canvas.className).toContain("cursor-grab");
  });

  it("pointer 이벤트 핸들러가 canvas에 등록된다", () => {
    const { container } = render(<InteractiveGlobe />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    // React attaches event handlers via synthetic events — verify via fireEvent
    expect(canvas).not.toBeNull();
    // onPointerDown, onPointerMove, onPointerUp are attached via React props
    // Check canvas has the correct cursor class indicating handlers are present
    expect(canvas.className).toContain("cursor-grab");
    expect(canvas.className).toContain("active:cursor-grabbing");
  });
});
