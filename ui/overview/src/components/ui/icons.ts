/* Icon registry: domain configs refer to icons by key (so a custom domain can be stored as JSON). */
import {
  Activity, ArrowLeftRight, Banknote, BedDouble, Bone, BookOpen, Box, Boxes, Briefcase, Building, Car, ChartColumn, CircleDashed,
  Cog, Cpu, CreditCard, Crown, Factory, FlaskConical, Gauge, GraduationCap, HandCoins, HeartPulse, Hospital, Landmark, Laptop,
  Lightbulb, Microscope, MonitorPlay, Package, Palette, PiggyBank, Pill, RefreshCw, School, ShieldCheck, Shirt, ShoppingBag, ShoppingBasket,
  ShoppingCart, Smartphone, Sofa, Sparkles, Stethoscope, Store, Target, TrendingUp, TriangleAlert, Truck, UserPlus, UserX, Users,
  Video, Wallet, Wrench, Zap, Ambulance, Plane, Warehouse, Layers, type LucideIcon,
} from 'lucide-react';

export const ICONS = {
  chart: ChartColumn, cart: ShoppingCart, store: Store, users: Users, target: Target, hospital: Hospital, stethoscope: Stethoscope,
  bed: BedDouble, landmark: Landmark, exchange: ArrowLeftRight, card: CreditCard, factory: Factory, package: Package, gauge: Gauge,
  school: School, graduation: GraduationCap, userPlus: UserPlus, wallet: Wallet, shirt: Shirt, phone: Smartphone, basket: ShoppingBasket,
  sofa: Sofa, sparkles: Sparkles, heart: HeartPulse, bone: Bone, microscope: Microscope, pill: Pill, banknote: Banknote, coins: HandCoins,
  piggy: PiggyBank, shield: ShieldCheck, trend: TrendingUp, car: Car, zap: Zap, cog: Cog, box: Box, wrench: Wrench, cpu: Cpu,
  briefcase: Briefcase, flask: FlaskConical, palette: Palette, monitor: MonitorPlay, crown: Crown, userX: UserX, dashed: CircleDashed,
  bag: ShoppingBag, boxes: Boxes, sync: RefreshCw, alert: TriangleAlert, bulb: Lightbulb, building: Building, activity: Activity,
  book: BookOpen, laptop: Laptop, video: Video, ambulance: Ambulance, plane: Plane, warehouse: Warehouse, truck: Truck, layers: Layers,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export const iconOf = (k: IconKey | string | undefined): LucideIcon => (k && k in ICONS ? ICONS[k as IconKey] : ChartColumn);
