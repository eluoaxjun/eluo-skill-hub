import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

function createIcon(
  displayName: string,
  pathData: string
): React.FC<IconProps> {
  const Icon: React.FC<IconProps> = ({ className, size = 24 }) =>
    React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        width: size,
        height: size,
        className,
        "aria-hidden": true,
      },
      React.createElement("path", { d: pathData })
    );
  Icon.displayName = displayName;
  return Icon;
}

/** dashboard - grid/4-squares layout */
export const DashboardIcon = createIcon(
  "DashboardIcon",
  "M13 9V3h8v6h-8ZM3 13V3h8v10H3Zm10 8V11h8v10h-8ZM3 21v-6h8v6H3Zm2-10h4V5H5v6Zm10 8h4v-6h-4v6Zm0-12h4V5h-4v2ZM5 19h4v-2H5v2Z"
);

/** storefront - shop/store front */
export const StorefrontIcon = createIcon(
  "StorefrontIcon",
  "M4 7l-.7 2H2v2h1v7a1 1 0 0 0 1 1h3v-5h2v5h3a1 1 0 0 0 1-1v-7h1V9h-1.3L12 7H4Zm17.73 2-.7-2H16l-1.3 2h-1.7v2h1v7a1 1 0 0 0 1 1h3v-5h2v5h1a1 1 0 0 0 1-1v-7h1V9h-1.27ZM2 3h20v2H2V3Z"
);

/** smart_toy - robot face */
export const SmartToyIcon = createIcon(
  "SmartToyIcon",
  "M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"
);

/** account_tree - org chart/tree */
export const AccountTreeIcon = createIcon(
  "AccountTreeIcon",
  "M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z"
);

/** edit_note - pencil with lines */
export const EditNoteIcon = createIcon(
  "EditNoteIcon",
  "M3 10h11v2H3v-2zm0-2h11V6H3v2zm0 8h7v-2H3v2zm15.01-3.13 1.41-1.41 2.12 2.12-1.41 1.41-2.12-2.12zm-.71.71-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z"
);

/** bar_chart - vertical bars chart */
export const BarChartIcon = createIcon(
  "BarChartIcon",
  "M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"
);

/** terminal - terminal/console prompt */
export const TerminalIcon = createIcon(
  "TerminalIcon",
  "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7.5 17l-1.41-1.41L8.67 13l-2.59-2.59L7.5 9l4 4-4 4z"
);

/** search - magnifying glass */
export const SearchIcon = createIcon(
  "SearchIcon",
  "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
);

/** notifications - bell */
export const NotificationsIcon = createIcon(
  "NotificationsIcon",
  "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
);

/** chevron_right - right arrow */
export const ChevronRightIcon = createIcon(
  "ChevronRightIcon",
  "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
);

/** add - plus sign */
export const AddIcon = createIcon(
  "AddIcon",
  "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
);

/** help_outline - question mark in circle */
export const HelpOutlineIcon = createIcon(
  "HelpOutlineIcon",
  "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
);

/** auto_awesome - sparkle/magic stars */
export const AutoAwesomeIcon = createIcon(
  "AutoAwesomeIcon",
  "m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"
);

/** contact_support - speech bubble with question mark */
export const ContactSupportIcon = createIcon(
  "ContactSupportIcon",
  "M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19H12v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-3.5h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"
);

/** brush - paint brush */
export const BrushIcon = createIcon(
  "BrushIcon",
  "M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 0 0 0-1.41z"
);

/** code - angle brackets */
export const CodeIcon = createIcon(
  "CodeIcon",
  "M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
);

/** bug_report - bug icon */
export const BugReportIcon = createIcon(
  "BugReportIcon",
  "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"
);

const ICON_REGISTRY: Record<string, React.FC<IconProps>> = {
  DashboardIcon,
  StorefrontIcon,
  SmartToyIcon,
  AccountTreeIcon,
  EditNoteIcon,
  BarChartIcon,
  TerminalIcon,
  BrushIcon,
  CodeIcon,
  BugReportIcon,
  SearchIcon,
  NotificationsIcon,
  ChevronRightIcon,
  AddIcon,
  HelpOutlineIcon,
  AutoAwesomeIcon,
  ContactSupportIcon,
};

export function getCategoryIcon(iconName: string): React.FC<IconProps> | null {
  return ICON_REGISTRY[iconName] ?? null;
}
