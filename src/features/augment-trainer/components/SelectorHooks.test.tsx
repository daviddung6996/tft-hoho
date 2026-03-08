import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PathSelector } from "./PathSelector";
import { PlanSelector } from "./PlanSelector";

describe("Mobile selector hooks", () => {
  it("renders PathSelector mobile hooks while preserving desktop title and subtitle nodes", () => {
    render(
      <PathSelector onPathDeclare={vi.fn()} stage="3-2" allPuzzlesCompleted />
    );

    expect(
      screen.getByTestId("selector-mobile-replay-pill")
    ).toBeInTheDocument();
    expect(screen.getByTestId("selector-mobile-title")).toBeInTheDocument();
    expect(document.querySelector(".path-selector-title")).not.toBeNull();
    expect(document.querySelector(".path-selector-subtitle")).not.toBeNull();
  });

  it("renders PlanSelector mobile hooks while preserving desktop title and subtitle nodes", () => {
    render(
      <PlanSelector onPlanDeclare={vi.fn()} stage="4-2" allPuzzlesCompleted />
    );

    expect(
      screen.getByTestId("selector-mobile-replay-pill")
    ).toBeInTheDocument();
    expect(screen.getByTestId("selector-mobile-title")).toBeInTheDocument();
    expect(screen.getByTestId("selector-mobile-helper")).toBeInTheDocument();
    expect(document.querySelector(".plan-selector-title")).not.toBeNull();
    expect(document.querySelector(".plan-selector-subtitle")).not.toBeNull();
  });
});
