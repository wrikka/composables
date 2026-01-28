// Event Handling
export * from "./app/utils/events";

// Storage
// export * from './app/browser/storage/useIndexedDB'
// export * from './app/browser/storage/useCookie'

export * from "./app/browser/device/useBattery";
export * from "./app/browser/device/useBluetooth";
export * from "./app/browser/device/useHID";
export * from "./app/browser/device/useMediaDevices";
export * from "./app/browser/device/useSerialPort";
export * from "./app/browser/device/useUSB";
export * from "./app/browser/device/useVibration";
export * from "./app/browser/device/useWakeLock";
// Events
export * from "./app/browser/events/useKeyboard";
export * from "./app/browser/events/useOnClickOutside";
export * from "./app/browser/events/useScroll";
export * from "./app/browser/location/useGeolocation";
export * from "./app/browser/location/useScreenOrientation";
// export * from './app/data/utils/useColor'
// Network & Integrations
export * from "./app/browser/network/useNetworkStatus";
export * from "./app/browser/network/useUrl";
export * from "./app/browser/permissions/useCameraPermission";
export * from "./app/browser/permissions/useMicrophonePermission";
export * from "./app/browser/permissions/useNotifications";
export * from "./app/browser/permissions/usePermission";
// export * from './app/browser/useInstallPrompt' // Temporarily disabled due to type issues
export * from "./app/browser/screen/usePageVisibility";
// Browser
export * from "./app/browser/screen/useColorScheme";
export * from "./app/browser/screen/usePixelRatio";
export * from "./app/browser/screen/usePreferredDark";
export * from "./app/browser/screen/useScreenSize";
export * from "./app/browser/screen/useWindowSize";
export { type ClipboardAPIOptions, useClipboardAPI } from "./app/browser/system/useClipboardAPI";
export * from "./app/browser/system/useConnection";
export {
  type DeviceOrientationOptions as DeviceOrientationSensorsOptions,
  useDeviceOrientation as useDeviceOrientationSensors,
} from "./app/browser/system/useDeviceOrientation";
export * from "./app/browser/system/useIdle";
export * from "./app/browser/system/useLanguage";
// Markdown Integration
export * from "./app/browser/system/useBrowserInfo";
export * from "./app/browser/system/usePerformance";
export * from "./app/browser/system/usePlatform";
export * from "./app/browser/system/usePointer";
export * from "./app/browser/system/useScreenCapture";
export * from "./app/browser/system/useUserAgent";
export { type MarkdownRenderOptions, useMarkdownRender } from "./app/utils/useMarkdownRender";
// State Management
export * from "./app/utils/state";
// Array Operations
export * from "./app/data/files/useFileDownload";
export * from "./app/data/files/useFileDrop";
export { useFileReader } from "./app/data/files/useFileReader";
export { useFileUpload } from "./app/data/files/useFileUpload";
export { useFileValidation } from "./app/data/files/useFileValidation";
export { useImageCompress } from "./app/data/files/useImageCompress";
export { useImagePreview } from "./app/data/files/useImagePreview";
export * from "./app/data/filters/useFilter";
export { useArray } from "./app/utils/arrays/useArray";
export { useArrayFilter } from "./app/utils/arrays/useArrayFilter";
export { useArrayGroup } from "./app/utils/arrays/useArrayGroup";
export { useArrayPagination } from "./app/utils/arrays/useArrayPagination";
export { useArraySearch } from "./app/utils/arrays/useArraySearch";
export { useArraySort } from "./app/utils/arrays/useArraySort";
// State Utilities
// export * from "./app/utils/state/useDebouncedState";
// export * from "./app/utils/state/useDerivedState";
// export * from "./app/utils/state/useGlobalState";
// export * from "./app/utils/state/useThrottledState";
// Note: Already exported from "./app/utils/state"
// export * from './app/data/utils/useSort'
// Table Operations
export { usePagination } from "./app/data/tables/usePagination";
export { useTable } from "./app/data/tables/useTable";
export { useTableExport } from "./app/data/tables/useTableExport";
export { useTableFilter } from "./app/data/tables/useTableFilter";
export { useTableSelection } from "./app/data/tables/useTableSelection";
export { useTableSort } from "./app/data/tables/useTableSort";
// Data Utils
export { useDragAndDrop } from "./app/data/utils/useDragAndDrop";
export { useHtmlToMarkdown } from "./app/data/utils/useHtmlToMarkdown";
export { useSearch } from "./app/data/utils/useSearch";
export * from "./app/ui/animation/useIntervalFn";
export * from "./app/ui/animation/useTimeoutFn";
// Animation
export * from "./app/ui/animation/useTransition";
// Utils
export * from "./app/ui/utilities/useMediaQuery";
// Validation
export { useFieldValidation, useFormValidation } from "./app/ui/validation";
export * from "./app/utils/time/useDateFormat";
// export * from './app/data/generators/useGenerator'
// export * from './app/data/utils/useDragAndDrop'
export * from "./app/utils/time/useTimer";

// Network
// export * from './app/browser/network'
// Note: useOnline and useNetwork have been moved to browser directory
// export * from './network/useOnline'
// export * from './network/useNetwork'

// Form
export { useField } from "./app/ui/form/useField";
export { useFieldArray } from "./app/ui/form/useFieldArray";
export { useForm } from "./app/ui/form/useForm";
export { useFormDirty } from "./app/ui/form/useFormDirty";
export { useFormValidation } from "./app/ui/form/useFormValidation";
// Interactions
export { useClickAway } from "./app/ui/interactions/useClickAway";
export { useFocusTrap } from "./app/ui/interactions/useFocusTrap";
export { useHotkeys } from "./app/ui/interactions/useHotkeys";
export { useScrollLock } from "./app/ui/interactions/useScrollLock";
// UI Utilities
export { useBreakpoints } from "./app/ui/utilities/useBreakpoints";
export { useColorMode } from "./app/ui/utilities/useColorMode";
export { useMediaQuery } from "./app/ui/utilities/useMediaQuery";
export { useResize } from "./app/ui/utilities/useResize";
export { useRtl } from "./app/ui/utilities/useRtl";
export { useTheme } from "./app/ui/utilities/useTheme";

// Math
export * from "./app/utils/math";
export {
  useCountdown as useCountdownTimer,
  type UseCountdownOptions as UseCountdownTimerOptions,
} from "./app/utils/time/useCountdown";
// Time
export * from "./app/utils/time/useDebounce";
// Time
export { useNow } from "./app/utils/time/useNow";
export * from "./app/utils/time/useThrottle";

// Data

// Navigation
// TODO: Add navigation utilities when available
// export * from './navigation/useRouter'
// export * from './navigation/useNavigation'

// Sensors
// export * from './app/browser/sensors'

// Internationalization
export * from "./app/utils/i18n";
// String
export * from "./app/utils/string";

// DOM
// export * from './app/browser/dom'

export {
  type MediaDevices,
  type RecordingStats,
  useVideoRecording,
  type VideoRecordingOptions,
  type VideoRecordingState,
} from "./app/browser/media/useVideoRecording";

// Server-side Composables
export { useCron, useHealthCheck, useLogger, useMetrics } from "./server/utils";

// Database Composables
export { useDatabase, useMutation, useQuery } from "./server/db";

// Services
export * from "./app/services";

// Shared Types
export * from "./app/types";

// Component
export { useMarkdownEditor } from "./app/ui/components/useMarkdownEditor";

// Formatters
export * from "./app/utils/formatters";
