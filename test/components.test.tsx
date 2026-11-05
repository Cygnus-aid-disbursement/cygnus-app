import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ProgressBar } from "../components/progress-bar";

describe("Badge", () => {
  it("renders with default neutral tone", () => {
    const html = renderToStaticMarkup(<Badge>Pending</Badge>);
    expect(html).toContain("bg-muted");
    expect(html).toContain("text-muted-foreground");
    expect(html).toContain("Pending");
  });

  it("renders with active tone", () => {
    const html = renderToStaticMarkup(<Badge tone="active">Active</Badge>);
    expect(html).toContain("bg-accent/15");
    expect(html).toContain("text-accent");
  });

  it("renders with warn tone", () => {
    const html = renderToStaticMarkup(<Badge tone="warn">Late</Badge>);
    expect(html).toContain("bg-amber-500/15");
  });
});

describe("Button", () => {
  it("renders default button variant", () => {
    const html = renderToStaticMarkup(<Button>Submit</Button>);
    expect(html).toContain("<button");
    expect(html).toContain("bg-primary");
    expect(html).toContain("Submit");
  });

  it("renders outline variant", () => {
    const html = renderToStaticMarkup(<Button variant="outline">Cancel</Button>);
    expect(html).toContain("border-border");
  });

  it("renders small size", () => {
    const html = renderToStaticMarkup(<Button size="sm">Small</Button>);
    expect(html).toContain("h-8");
  });
});

describe("Card", () => {
  it("renders card structure with header and content", () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(html).toContain("rounded-lg border border-border bg-card");
    expect(html).toContain("text-base font-semibold");
    expect(html).toContain("Title");
    expect(html).toContain("Body");
  });
});

describe("ProgressBar", () => {
  it("renders progress percentage width style", () => {
    const html = renderToStaticMarkup(<ProgressBar value={45} />);
    expect(html).toContain("width:45%");
    expect(html).toContain("bg-accent");
  });
});
