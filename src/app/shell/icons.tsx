import type { ComponentType } from 'react';
import {
  SidebarSimple,
  CaretLeft,
  CaretRight,
  CaretDown,
  ArrowClockwise,
  Monitor,
  DeviceTablet,
  DeviceMobile,
  CornersOut,
  SquaresFour,
  Flag,
  ArrowCounterClockwise,
  X,
  Plus,
  ShareNetwork,
  Copy,
  Check,
  ArrowSquareOut,
  QrCode,
  Sun,
  Moon,
  GearSix,
  Stack,
  Presentation,
  Layout,
  MagnifyingGlass,
  Keyboard,
  Columns,
  Info,
  CaretUpDown,
  SlidersHorizontal,
  type IconProps,
} from '@phosphor-icons/react';

/**
 * Studio chrome icons — Phosphor (https://phosphoricons.com/), wrapped under
 * stable `Ic*` names so consumers don't import Phosphor directly. Default 18px,
 * currentColor; pass `size` / `className` to override (CSS still wins for sizing).
 */
type P = { className?: string; size?: number };
const DEFAULT_SIZE = 18;

const ic =
  (Icon: ComponentType<IconProps>) =>
  ({ className, size }: P) =>
    <Icon size={size ?? DEFAULT_SIZE} className={className} weight="regular" />;

export const IcSidebar = ic(SidebarSimple);
export const IcChevronLeft = ic(CaretLeft);
export const IcChevronRight = ic(CaretRight);
export const IcChevronDown = ic(CaretDown);
export const IcRefresh = ic(ArrowClockwise);
export const IcDesktop = ic(Monitor);
export const IcTablet = ic(DeviceTablet);
export const IcMobile = ic(DeviceMobile);
export const IcExpand = ic(CornersOut);
export const IcGrid = ic(SquaresFour);
export const IcFlag = ic(Flag);
export const IcReset = ic(ArrowCounterClockwise);
export const IcClose = ic(X);
export const IcPlus = ic(Plus);
export const IcShare = ic(ShareNetwork);
export const IcCopy = ic(Copy);
export const IcCheck = ic(Check);
export const IcExternal = ic(ArrowSquareOut);
export const IcQr = ic(QrCode);
export const IcSun = ic(Sun);
export const IcMoon = ic(Moon);
export const IcSettings = ic(GearSix);
export const IcLayers = ic(Stack);
export const IcPresent = ic(Presentation);
export const IcLayout = ic(Layout);
export const IcSearch = ic(MagnifyingGlass);
export const IcKeyboard = ic(Keyboard);
export const IcColumns = ic(Columns);
export const IcConfig = ic(SlidersHorizontal);
export const IcInfo = ic(Info);
/** The up/down sort chevron Minimal uses on its workspace switcher. */
export const IcSort = ic(CaretUpDown);
