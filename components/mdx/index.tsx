import type { ComponentProps } from "react";
import { Callout } from "./Callout";
import { Step } from "./Step";
import { Compare } from "./Compare";
import { KeyTakeaways } from "./KeyTakeaways";

/**
 * The MDX provider map: the approved custom lesson components plus base-element
 * styling for the explanation prose. Authors may only use the components
 * registered here (CONTENT_MODEL §body conventions).
 */
export const mdxComponents = {
  Callout,
  Step,
  Compare,
  KeyTakeaways,
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-8 mb-3 text-[18px] font-semibold tracking-tight text-text" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-6 mb-2 text-[15px] font-semibold text-text" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-3 text-[14px] leading-relaxed text-text-2" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-3 ml-5 list-disc space-y-1.5 text-[14px] leading-relaxed text-text-2" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-3 ml-5 list-decimal space-y-1.5 text-[14px] leading-relaxed text-text-2" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="pl-1" {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a className="text-emerald underline-offset-2 hover:underline" {...props} />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-text" {...props} />
  ),
  code: (props: ComponentProps<"code">) => (
    <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12px] text-text" {...props} />
  ),
};
