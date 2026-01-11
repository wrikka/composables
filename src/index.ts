// Core

// Storage
// export * from './browser/storage/useIndexedDB'
// export * from './browser/storage/useCookie'

export * from "./browser/device/useBattery";
export * from "./browser/device/useMediaDevices";
export * from "./browser/device/useVibration";
export * from "./browser/device/useWakeLock";
// Events
export * from "./browser/events/useKeyboard";
export * from "./browser/events/useOnClickOutside";
export * from "./browser/events/useScroll";
export * from "./browser/location/useGeolocation";
export * from "./browser/location/useScreenOrientation";
// export * from './data/utils/useColor'
export * from "./browser/network/useUrl";
export * from "./browser/permissions/usePermission";
// export * from './browser/useInstallPrompt' // Temporarily disabled due to type issues
export * from "./browser/screen/usePageVisibility";
// Browser
export * from "./browser/screen/usePreferredDark";
export * from "./browser/screen/useWindowSize";
export {
	type ClipboardAPIOptions,
	useClipboardAPI,
} from "./browser/system/useClipboardAPI";
export * from "./browser/system/useConnection";
export {
	type DeviceOrientationOptions as DeviceOrientationSensorsOptions,
	useDeviceOrientation as useDeviceOrientationSensors,
} from "./browser/system/useDeviceOrientation";
export * from "./browser/system/useIdle";
export * from "./browser/system/useLanguage";
export {
	type MarkdownRenderOptions,
	useMarkdownRender,
} from "./browser/system/useMarkdownRender";
export * from "./browser/system/usePointer";
export * from "./browser/system/useScreenCapture";
// State
export * from "./core/state";
export * from "./data/arrays/useArray";
export * from "./data/files/useFileDownload";
export * from "./data/files/useFilePicker";
export * from "./data/files/useFileReader";
export * from "./data/files/useImageUpload";
export * from "./data/filters/useFilter";
// export * from './data/utils/useSort'
// export * from './data/utils/useSearch'
export * from "./data/tables/usePagination";
export * from "./data/tables/useTable";
export * from "./ui/animation/useIntervalFn";
export * from "./ui/animation/useTimeoutFn";
// Animation
export * from "./ui/animation/useTransition";
// Utils
export * from "./ui/utilities/useMediaQuery";
// Validation
export * from "./ui/validation";
export * from "./utils/time/useDateFormat";
// export * from './data/generators/useGenerator'
// export * from './data/utils/useDragAndDrop'
export * from "./utils/time/useTimer";

// Network
// export * from './browser/network'
// Note: useOnline and useNetwork have been moved to browser directory
// export * from './network/useOnline'
// export * from './network/useNetwork'

// Form
export * from "./ui/form/useForm";
export * from "./ui/interactions";
// UI
export * from "./ui/utilities/useResize";

// Math
export * from "./utils/math";
export {
	type UseCountdownOptions as UseCountdownTimerOptions,
	useCountdown as useCountdownTimer,
} from "./utils/time/useCountdown";
// Time
export * from "./utils/time/useDebounce";
// Time
export { useNow } from "./utils/time/useNow";
export * from "./utils/time/useThrottle";

// Data

// Navigation
// TODO: Add navigation utilities when available
// export * from './navigation/useRouter'
// export * from './navigation/useNavigation'

// Sensors
// export * from './browser/sensors'

// i18n
export * from "./core/i18n";
// String
export * from "./utils/string";

// DOM
// export * from './browser/dom'

export {
	type MediaDevices,
	type RecordingStats,
	useVideoRecording,
	type VideoRecordingOptions,
	type VideoRecordingState,
} from "./browser/media/useVideoRecording";
// Component
export * from "./ui/component";

// New Composables
export {
	type MarkdownEditorCommands,
	type MarkdownEditorOptions,
	type MarkdownEditorState,
	useMarkdownEditor,
} from "./ui/components/useMarkdownEditor";
// Formatters
export * from "./utils/formatters";
// export { useHtmlToMarkdown, type HtmlToMarkdownOptions, type ConversionState } from './data/utils/useHtmlToMarkdown'
