export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  path?: string;
  onClick?: () => void;
  children?: MenuItem[]; // for nested menu items
}