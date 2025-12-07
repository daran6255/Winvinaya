import { menuItems } from "../constants/menuItems";
import type { BreadcrumbItem } from "../components/common/AppBreadcrumbs";

export function findBreadcrumbPath(path: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

  for (const section of menuItems) {
    for (const item of section.items) {
      if (item.path === path) {
        breadcrumbs.push({ label: item.label, path: item.path });
        return breadcrumbs;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            breadcrumbs.push({ label: item.label, path: item.path });
            breadcrumbs.push({ label: child.label, path: child.path });
            return breadcrumbs;
          }
        }
      }
    }
  }
  return breadcrumbs;
}
