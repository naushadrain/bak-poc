import { NAV_ITEMS } from "@/models/constants/navigation";

/** Path segments with no page of their own, so they'd be dead links in the trail. */
const PATHS_WITHOUT_PAGES = ["/property"];

export interface Breadcrumb {
  label: string;
  href: string;
}

/** True on the link's own page and on any page nested below it. */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function labelForSegment(segment: string, href: string) {
  const navItem = NAV_ITEMS.find((item) => item.href === href);
  if (navItem) return navItem.label;
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Builds the trail from Home to the current page. The last item is the page title. */
export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const trail = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return { label: labelForSegment(segment, href), href };
  });
  return [
    { label: "Home", href: "/" },
    ...trail.filter((crumb) => !PATHS_WITHOUT_PAGES.includes(crumb.href)),
  ];
}
