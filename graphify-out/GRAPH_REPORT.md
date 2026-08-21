# Graph Report - raqim-house  (2026-08-21)

## Corpus Check
- Large corpus: 455 files · ~810,533 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1974 nodes · 5275 edges · 189 communities (132 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.84)
- Token cost: 0 input · 505,603 output

## Community Hubs (Navigation)
- Download Token Management
- Form & Dialog Components
- Analytics Chart Components
- SEO Prerendering Script
- Admin Topbar & Navigation
- Communications Block Registry
- Coupons Seed Generator
- Media Seed Generator
- Hero Scene Components
- Book Form & Repository
- Library Files Context
- Site Content & 3D Book
- App Shell & Layout
- Shared UI Widgets
- Motion & Ornament Primitives
- Search & Error UI
- Status Badge & Article Status
- Communication Templates Context
- Articles/Library Utilities & Permissions
- Communication Content Types
- Categories Seed & Context
- Articles Context
- Settings Context & Repository
- Design Constitution Tiers
- Toast Notifications & Hooks
- TypeScript & Vite Config
- Admin App Routing
- Bulk Actions & Filters
- Confirm Dialog & DataTable
- Admin Auth Context
- Book Placement & Language Switch
- Order Attachments Repository
- Orders Context
- Payment Method Badge & Icons
- Button Component
- Site Content Migrations & Repeater
- Text Input Components
- Communications Category Pages
- Sitemap Generator Script
- File Dropzone & Brand Section
- Timeline Components
- Checkout Context & Summary Card
- Foundation Tables Migration
- Build Tooling Dependencies
- Admin Providers & Customer Notes
- History Adapter Services
- Order Status & Items Card
- Animation & React Dependencies
- Settings Page Sections
- Books Seed Generator
- Analytics & Placeholder Pages
- Categories & Author Pages
- Payment Confirmation Form
- Books Context
- Communication Categories Context
- Admin Layout & Sidebar
- Admin Invitation Lifecycle Migration
- Publisher Brand Images
- Admin RPC Auth Fix Migration
- Role Permissions & Routes
- Download Email Template Preview
- Template Section Form Modal
- Email Provider Adapters
- App Error Boundary
- Checkout Hero & Language Context
- Brand DNA & Design Tiers
- Admin Security Foundation Migration
- Articles Seed Generator
- Communication Theme Registry
- Admin Invitation Email API
- Design System Doc Lineage
- NPM Scripts
- Kuni Hajar Product Images
- Kuni Hajar Book Pages
- Invitation Trash & Permission Overrides
- Payment Notification Email API
- Download Email API
- Hero Scene Layered Images
- Shape Engine & Shared Components
- Settings Seed Generator
- Payment Notification Claims Migration
- Package Metadata
- Raqim & Lumora Brand Images
- Protected Route & Login Page
- 3D Book Backup Component
- 3D Book Stable Component
- Books Table Migration
- Download Tokens Table Migration
- Order Attachment Init API
- Lumora Coming Soon Images
- Raqim/Lumora Logos & OG Image
- Orders Table Migration
- Coupons Table Migration
- Articles Table Migration
- Order Attachment Confirm API
- Admin Notification Email API
- Elevation Design Tokens
- Spacing Design Tokens
- Arabesque Pattern & Book Cutout
- Library Files Table Migration
- Kuni Hajar Back Cover
- Conversations Public Intake Migration
- Coupon Validation RPC Migration
- Vite Env Types
- Foundation RLS Migration
- has_permission() Function Migration
- Order Attachments Table Migration
- Order Exists Helper Migration
- Checkout Attempt ID Migration
- Vercel Config
- Icon Design Philosophy
- Texture Design Philosophy
- Editorial Layout Principles
- Luxury Interaction Philosophy
- Dashboard Experience Philosophy
- ESLint React Hooks Plugin
- ESLint React Refresh Plugin
- Tailwind Vite Plugin
- Node Type Definitions
- React Type Definitions
- TypeScript Dependency
- Kuni Hajar Reader's Guide
- Media Assets & Folders
- Hero Birds Illustration Variants
- Conversations Table Migration
- Newsletter Subscribers Migration
- Design Amendment Rules
- Design Decision Hierarchy
- Growth Constraints Tier
- Interaction Constraints Tier
- Trust Constraints Tier
- UX Constraints Tier
- Design Validation Checklist
- Cognitive Design Gap
- Governance Gap
- System Evolution Gap
- Writing System Gap
- Arabic Typography Philosophy
- Color Philosophy V1
- Component Philosophy V1
- Border Design Philosophy
- Ten Design Principles
- Editorial Design Principles
- DataTable Component Reference
- Input System Reference
- StatusBadge Component Reference
- Our Philosophy Section Image
- Hero Mist Layer Image
- Categories Table Reference
- Orders Table Reference
- Orders Table Reference
- Orders Table Reference

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 96 edges
2. `useBooks()` - 47 edges
3. `useSettings()` - 43 edges
4. `LocalizedText` - 37 edges
5. `getSupabaseClient()` - 35 edges
6. `useAuth()` - 33 edges
7. `PageHeader()` - 26 edges
8. `AdminOrder` - 26 edges
9. `Helmet()` - 26 edges
10. `buildGraph()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Hajar (هاجر) as Archetype of Maternal Resilience` --semantically_similar_to--> `Brand DNA (al-Raqim thesis)`  [INFERRED] [semantically similar]
  public/books/kuni-hajar/preview.pdf → docs/design-system/RAQIM-DESIGN-SYSTEM.md
- `SEO / Open Graph / Twitter Meta Tags` --semantically_similar_to--> `Luxury Positioning (care, not decoration)`  [INFERRED] [semantically similar]
  index.html → docs/design-system/RAQIM-DESIGN-SYSTEM.md
- `Kuni Hajar (كوني هاجر) Book Preview PDF` --conceptually_related_to--> `Editorial Constraints (Tier 3, EC)`  [INFERRED]
  public/books/kuni-hajar/preview.pdf → docs/design-system/RAQIM-DESIGN-CONSTITUTION.md
- `Brand Typography & Color Prototype (internal research)` --conceptually_related_to--> `Color Philosophy (Phase 1.5)`  [AMBIGUOUS]
  public/brand-prototype.html → docs/design-system/RAQIM-VISUAL-LANGUAGE.md
- `localizedEntries` --calls--> `withLanguagePrefix()`  [EXTRACTED]
  scripts/generate-sitemap.mjs → src/lib/seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **RAQIM Design Documentation Phased Lineage** — docs_design_system_raqim_design_system, docs_design_system_raqim_foundation_design_system, docs_design_system_raqim_visual_language, docs_design_system_raqim_design_engine, docs_design_system_raqim_token_registry [EXTRACTED 1.00]
- **RAQIM Constitution Tiered Precedence Hierarchy** — docs_design_system_raqim_design_constitution_non_negotiable_principles, docs_design_system_raqim_design_constitution_product_identity_constraints, docs_design_system_raqim_design_constitution_trust_constraints, docs_design_system_raqim_design_constitution_editorial_constraints, docs_design_system_raqim_design_constitution_ux_constraints, docs_design_system_raqim_design_constitution_interaction_constraints, docs_design_system_raqim_design_constitution_growth_constraints [EXTRACTED 1.00]
- **Milestone 6 Shared Admin Component Consolidation** — docs_design_system_raqim_token_registry_button_component, docs_design_system_raqim_token_registry_input_system, docs_design_system_raqim_token_registry_panel_component, docs_design_system_raqim_token_registry_data_table_component, docs_design_system_raqim_token_registry_status_badge_component [EXTRACTED 1.00]
- **Hero Scene Layered Composite (Clouds, Foreground, Dust, Landscape, Light)** — src_assets_hero_hero_clouds_hero_clouds_layer, src_assets_hero_hero_foreground_hero_foreground_layer, src_assets_hero_hero_golden_dust_hero_golden_dust_overlay, src_assets_hero_hero_landscape_hero_landscape_scene, src_assets_hero_hero_light_hero_light_ray_overlay, concept_hero_scene [INFERRED 0.85]

## Communities (189 total, 57 thin omitted)

### Community 0 - "Download Token Management"
Cohesion: 0.05
Nodes (50): computeExpiresAt(), DownloadsContext, DownloadsContextValue, DownloadsProvider(), DownloadTokenRow, downloadTokensRepository, generateRawToken(), hashToken() (+42 more)

### Community 1 - "Form & Dialog Components"
Cohesion: 0.06
Nodes (61): Select(), SelectOption, SelectProps, Drawer(), DrawerProps, Modal(), ModalProps, SIZE_CLASS (+53 more)

### Community 2 - "Analytics Chart Components"
Cohesion: 0.07
Nodes (50): AreaChart(), AreaChartProps, Sparkline(), SparklineProps, MetricCard(), MetricCardProps, Panel(), PanelProps (+42 more)

### Community 3 - "SEO Prerendering Script"
Cohesion: 0.10
Nodes (42): AR_STRINGS, { books, authors, articles, blogIndexLastmod }, __dirname, DIST_DIR, EN_STRINGS, escapeHtml(), homeCrumb(), hreflangFor() (+34 more)

### Community 4 - "Admin Topbar & Navigation"
Cohesion: 0.08
Nodes (37): AdminTopbar(), AdminTopbarProps, NOTIFICATIONS, QUICK_ACTIONS, base, IconArchive(), IconBag(), IconBell() (+29 more)

### Community 5 - "Communications Block Registry"
Cohesion: 0.08
Nodes (32): CommunicationVariablesPage(), GlobalComponentsPage(), BLOCK_REGISTRY, BlockRenderer, getBlockRenderer(), listRegisteredBlockTypes(), registerBlockRenderer(), registryKey() (+24 more)

### Community 6 - "Coupons Seed Generator"
Cohesion: 0.09
Nodes (31): __dirname, nullableNumberLiteral(), nullableTextLiteral(), OUTPUT_DIR, OUTPUT_PATH, rows, textLiteral(), SegmentedControl() (+23 more)

### Community 7 - "Media Seed Generator"
Cohesion: 0.12
Nodes (31): assetRows, __dirname, folderRows, nullableNumberLiteral(), nullableTextLiteral(), OUTPUT_DIR, OUTPUT_PATH, textLiteral() (+23 more)

### Community 8 - "Hero Scene Components"
Cohesion: 0.11
Nodes (26): HeroBackground(), HeroBackgroundProps, HeroBirds(), HeroBirdsProps, HeroBook(), HeroBookProps, HeroClouds(), HeroCloudsProps (+18 more)

### Community 9 - "Book Form & Repository"
Cohesion: 0.10
Nodes (31): ImageListEditor(), ImageListEditorProps, BookContent, BookSupabaseRow, BOOK_PLACEMENT_OPTIONS, BookForm(), BookFormProps, BookFormValues (+23 more)

### Community 10 - "Library Files Context"
Cohesion: 0.11
Nodes (24): EXTENSION_FORMAT, formatFromFilename(), LibraryContext, LibraryContextValue, LibraryProvider(), today(), fileFromSupabaseRow(), fileToSupabaseRow() (+16 more)

### Community 11 - "Site Content & 3D Book"
Cohesion: 0.11
Nodes (31): useSiteContent(), NumeralCTA(), StampCTA(), UnderlineLink(), FlipBookHandle, PAGE_JITTER, PageFlipController, PremiumBook3D() (+23 more)

### Community 12 - "App Shell & Layout"
Cohesion: 0.22
Nodes (20): Reveal(), PageHeader(), PageShell(), ScrollToTop(), StructuredData(), formatNumeral(), toLatinDigits(), breadcrumbSchema() (+12 more)

### Community 13 - "Shared UI Widgets"
Cohesion: 0.12
Nodes (24): CopyIconButton(), CopyIconButtonProps, CustomerAvatar(), CustomerAvatarProps, SIZE_CLASS, Pagination(), PaginationProps, StatCard() (+16 more)

### Community 14 - "Motion & Ornament Primitives"
Cohesion: 0.10
Nodes (22): CursorDrift(), Floating(), LuxurySpring, MouseTilt(), ParallaxLayer(), ArchFrame(), CornerFlourish(), GoldDivider() (+14 more)

### Community 15 - "Search & Error UI"
Cohesion: 0.11
Nodes (25): LoadErrorBanner(), LoadErrorBannerProps, SearchInput(), SearchInputProps, useAdminUsers(), IconAlertTriangle(), IconCheck(), IconRefresh() (+17 more)

### Community 16 - "Status Badge & Article Status"
Cohesion: 0.13
Nodes (23): StatusBadge(), StatusBadgeProps, StatusBadgeVariant, VARIANT_CLASSES, ARTICLE_STATUS_META, ARTICLE_STATUS_OPTIONS, estimateReadingMinutes(), ArticleEditor() (+15 more)

### Community 17 - "Communication Templates Context"
Cohesion: 0.15
Nodes (28): asSectionArray(), backfillDownloadEmailEnglish(), CommunicationTemplateFormValues, CommunicationTemplatesContext, CommunicationTemplatesContextValue, CommunicationTemplatesProvider(), migrateDesignSettings(), migrateLocalizedText() (+20 more)

### Community 18 - "Articles/Library Utilities & Permissions"
Cohesion: 0.16
Nodes (20): useArticles(), useLibrary(), IconTrash(), IconUpload(), findAssetUsage(), formatBytes(), can(), ArticlesListPage() (+12 more)

### Community 19 - "Communication Content Types"
Cohesion: 0.11
Nodes (22): ConditionRule, ContentBlock, ContentSection, ContentVisibility, LayoutSlotId, TemplateContent, GlobalComponent, GlobalComponentCategory (+14 more)

### Community 20 - "Categories Seed & Context"
Cohesion: 0.12
Nodes (23): __dirname, jsonbLiteral(), OUTPUT_DIR, OUTPUT_PATH, rows, textLiteral(), CategoriesContext, CategoriesContextValue (+15 more)

### Community 21 - "Articles Context"
Cohesion: 0.15
Nodes (23): ArticlesContext, ArticlesContextValue, ArticlesProvider(), migrateArticle(), migrateLocalizedText(), resolveArticle(), resolveText(), slugify() (+15 more)

### Community 22 - "Settings Context & Repository"
Cohesion: 0.16
Nodes (23): migrateLocalizedText(), resolveText(), SettingsContext, SettingsContextValue, SettingsProvider(), getSettings(), updateSettings(), BookCurrency (+15 more)

### Community 23 - "Design Constitution Tiers"
Cohesion: 0.08
Nodes (25): Product Identity Constraints (Tier 1, PIC), Color Engine (named tokens), Typography Engine (token hierarchies), Information Architecture Philosophy (gap), Editorial Identity (publishing house, not marketplace), Luxury Positioning (care, not decoration), Typography System (Phase 1), Color Engine Implementation Tokens (+17 more)

### Community 24 - "Toast Notifications & Hooks"
Cohesion: 0.15
Nodes (22): Toast(), ToastProps, ToastState, ToastVariant, useCommunicationTemplates(), useDownloads(), EMAIL_SENT_TIMELINE_LABEL, DOWNLOAD_EMAIL_TEMPLATE_ID (+14 more)

### Community 25 - "TypeScript & Vite Config"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2022, src, vite.config.ts, compilerOptions, allowImportingTsExtensions, jsx (+16 more)

### Community 26 - "Admin App Routing"
Cohesion: 0.16
Nodes (13): RequirePermission(), BookEditPage, BookNewPage, booksRoutes, categoriesRoutes, customersRoutes, dashboardRoutes, downloadsRoutes (+5 more)

### Community 27 - "Bulk Actions & Filters"
Cohesion: 0.12
Nodes (19): BulkAction, BulkActionBar(), BulkActionBarProps, FilterBar(), FilterOption, FilterSelect(), FilterSelectProps, BOOK_PLACEMENT_META (+11 more)

### Community 28 - "Confirm Dialog & DataTable"
Cohesion: 0.22
Nodes (14): ConfirmDialog(), ConfirmDialogProps, ALIGN_CLASS, DataTable(), DataTableColumn, DataTableProps, EmptyState(), EmptyStateProps (+6 more)

### Community 29 - "Admin Auth Context"
Cohesion: 0.15
Nodes (13): AuthContext, AuthContextValue, AuthProvider(), readSession(), SEED_CREDENTIALS, SEED_USER, writeSession(), createLocalAuthAdapter() (+5 more)

### Community 30 - "Book Placement & Language Switch"
Cohesion: 0.13
Nodes (15): useBooks(), isInLibraryGrid(), BrandStudioPage(), LanguageSwitcher(), OPTIONS, NewsletterBand(), NewsletterStatus, SiteFooter() (+7 more)

### Community 31 - "Order Attachments Repository"
Cohesion: 0.14
Nodes (19): AllowedAttachmentMimeType, fromRow(), getOrderAttachments(), getOrderAttachmentSignedUrl(), OrderAttachment, OrderAttachmentRow, readJsonError(), uploadOrderAttachment() (+11 more)

### Community 32 - "Orders Context"
Cohesion: 0.18
Nodes (21): ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL, ConfirmPaymentOutcome, CreateOrderInput, customerIdFromEmail(), now(), OrdersContext, OrdersProvider(), PermanentDeleteOutcome (+13 more)

### Community 33 - "Payment Method Badge & Icons"
Cohesion: 0.13
Nodes (15): PaymentMethodBadge(), PaymentMethodBadgeProps, CopyButton(), CopyButtonProps, IconArrowLeft(), IconCheck(), IconCopy(), iconMap (+7 more)

### Community 34 - "Button Component"
Cohesion: 0.10
Nodes (20): Button, ButtonProps, ButtonSize, ButtonVariant, SIZE_CLASSES, SPINNER_CLASSES, VARIANT_CLASSES, COLOR_VARS (+12 more)

### Community 35 - "Site Content Migrations & Repeater"
Cohesion: 0.18
Nodes (17): Repeater(), RepeaterProps, migrateFaqs(), migrateFields(), migrateLocalizedText(), ResolvedFaqItem, resolveText(), SiteContentContext (+9 more)

### Community 36 - "Text Input Components"
Cohesion: 0.18
Nodes (13): TextArea(), TextAreaProps, TextField(), TextFieldProps, EMPTY, ContactSectionProps, EDITING_LANGUAGE_OPTIONS, GeneralSectionProps (+5 more)

### Community 37 - "Communications Category Pages"
Cohesion: 0.15
Nodes (18): useCommunicationCategories(), IconArrowDown(), IconArrowUp(), CommunicationCategoryFormModal(), CommunicationTemplateFormModal(), CommunicationCategoriesPage(), CommunicationDashboardPage(), CommunicationTemplateEditorPage() (+10 more)

### Community 38 - "Sitemap Generator Script"
Cohesion: 0.12
Nodes (16): articleEntries, authorEntries, blogIndexEntry, body, bookEntries, { books, authors, articles, blogIndexLastmod }, dedupedEntries, __dirname (+8 more)

### Community 39 - "File Dropzone & Brand Section"
Cohesion: 0.14
Nodes (13): FileDropzone(), FileDropzoneProps, MediaPickerModal(), BrandSectionProps, COLOR_LABELS, FONT_OPTIONS, FONT_ROLE_LABELS, OBJECT_FIT_OPTIONS (+5 more)

### Community 40 - "Timeline Components"
Cohesion: 0.15
Nodes (13): DOT_TONE_CLASS, Timeline(), TimelineEntry, TimelineProps, TimelineTone, CustomerActivityTimelineCard(), CustomerActivityTimelineCardProps, CustomerContactCardProps (+5 more)

### Community 41 - "Checkout Context & Summary Card"
Cohesion: 0.19
Nodes (12): ProductSummaryCard(), ProductSummaryCardProps, CheckoutContext, CheckoutContextValue, CheckoutProvider(), ConfirmationData, createAttemptId(), readOrCreateAttemptId() (+4 more)

### Community 42 - "Foundation Tables Migration"
Cohesion: 0.15
Nodes (14): auth.users, public.set_content_history_version, public.admin_profiles, public.categories, public.content_history, public.media_assets, public.media_folders, public.redirects (+6 more)

### Community 43 - "Build Tooling Dependencies"
Cohesion: 0.12
Nodes (17): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, tailwindcss (+9 more)

### Community 44 - "Admin Providers & Customer Notes"
Cohesion: 0.17
Nodes (13): AdminProviders(), PROVIDERS, CommunicationCategoriesProvider(), CustomerNote, CustomerNotesContext, CustomerNotesContextValue, CustomerNotesProvider(), useCustomerNotes() (+5 more)

### Community 45 - "History Adapter Services"
Cohesion: 0.21
Nodes (7): createHistoryAdapter(), createLocalHistoryAdapter(), createSupabaseHistoryAdapter(), HistoryRow, HistoryAdapter, HistoryBackend, HistoryEntry

### Community 46 - "Order Status & Items Card"
Cohesion: 0.20
Nodes (13): OrdersContextValue, ORDER_STATUS_META, ORDER_STATUS_OPTIONS, PAYMENT_STATUS_META, resolvePaymentStatusMeta(), OrderAttachmentsCardProps, OrderItemsCard(), OrderItemsCardProps (+5 more)

### Community 47 - "Animation & React Dependencies"
Cohesion: 0.13
Nodes (15): framer-motion, motion, dependencies, framer-motion, motion, react, react-dom, react-pageflip (+7 more)

### Community 48 - "Settings Page Sections"
Cohesion: 0.23
Nodes (13): useSettings(), BrandSection(), ContactSection(), GeneralSection(), HomePageSection(), SeoSection(), StorageSection(), ALL_CURRENCIES (+5 more)

### Community 49 - "Books Seed Generator"
Cohesion: 0.23
Nodes (12): CATEGORY_NAME_TO_ID, __dirname, jsonbLiteral(), nullableTextLiteral(), OUTPUT_DIR, OUTPUT_PATH, resolveCategoryId(), rows (+4 more)

### Community 50 - "Analytics & Placeholder Pages"
Cohesion: 0.22
Nodes (8): AdminPagePlaceholder(), AdminPagePlaceholderProps, AnalyticsPage(), analyticsRoutes, CommunicationHistoryPage(), CommunicationSettingsPage(), communicationsRoutes, CommunicationTemplateEditorPage

### Community 51 - "Categories & Author Pages"
Cohesion: 0.22
Nodes (11): useCategories(), CategoriesPage(), Helmet(), localizeProperName(), PROPER_NAME_TRANSLATIONS, resolveAuthorSeoTitle(), AuthorPage(), AuthorSection() (+3 more)

### Community 52 - "Payment Confirmation Form"
Cohesion: 0.23
Nodes (12): ALLOWED_ATTACHMENT_MIME_TYPES, MAX_ATTACHMENT_SIZE_BYTES, ConfirmationFormValues, PaymentConfirmationForm(), PaymentConfirmationFormProps, getPaymentMethod(), useCheckout(), computeDiscountedPrice() (+4 more)

### Community 53 - "Books Context"
Cohesion: 0.27
Nodes (12): BooksContext, BooksContextValue, BooksProvider(), migrateBook(), migrateLocalizedText(), resolveBook(), resolveText(), slugify() (+4 more)

### Community 54 - "Communication Categories Context"
Cohesion: 0.24
Nodes (9): CommunicationCategoriesContext, CommunicationCategoriesContextValue, INITIAL_COMMUNICATION_CATEGORIES, CommunicationCategoryFormModalProps, CommunicationTemplateFormModalProps, EMPTY, STATUS_OPTIONS, CategoryRow (+1 more)

### Community 55 - "Admin Layout & Sidebar"
Cohesion: 0.24
Nodes (9): AdminBreadcrumbs(), AdminLayout(), readStoredCollapsed(), AdminMobileDrawer(), AdminMobileDrawerProps, AdminSidebar(), AdminSidebarProps, IconPanelCollapse() (+1 more)

### Community 56 - "Admin Invitation Lifecycle Migration"
Cohesion: 0.18
Nodes (5): public.admin_invitations, public.approve_admin_invitation(), public.create_admin_invitation(), public.admin_profiles, public.platform_ownership

### Community 57 - "Publisher Brand Images"
Cohesion: 0.31
Nodes (11): Book Linen, دار نور للنشر والتوزيع (Dar Nour Publishing & Distribution) — brand, ليلى البياتي (Laila Al-Bayati) — Author, أنثى الأرض (Untha Al-Ard) — Book Title, الأندلس: مجد الحضارة وجمال الفن (Al-Andalus) — Book Title, Books Grid, دار النخبة للنشر (Dar Al-Nukhba Publishing) — brand, ديوان الحب والحنين (Diwan Al-Hubb Wal-Hanin) — Book Title (+3 more)

### Community 58 - "Admin RPC Auth Fix Migration"
Cohesion: 0.20
Nodes (4): public.create_admin_invitation(), public.reactivate_admin(), public.admin_profiles, public.platform_ownership

### Community 59 - "Role Permissions & Routes"
Cohesion: 0.27
Nodes (6): RequireRole(), Capability, ROLE_CAPABILITIES, adminUsersRoutes, AdminNavItem, AdminRole

### Community 60 - "Download Email Template Preview"
Cohesion: 0.31
Nodes (8): TemplatePreviewModal(), absoluteUrl(), buildDownloadEmailDocument(), DEFAULT_DESIGN, DownloadEmailDesignOverrides, DownloadEmailDocumentParams, escapeHtml(), formatExpiry()

### Community 61 - "Template Section Form Modal"
Cohesion: 0.29
Nodes (9): EMPTY_FIELDS, EMPTY_LOCALIZED, FieldsState, fieldsToState(), SECTION_TYPE_OPTIONS, stateToFields(), TemplateSectionFormModal(), trimLocalized() (+1 more)

### Community 62 - "Email Provider Adapters"
Cohesion: 0.33
Nodes (5): EMAIL_PROVIDERS, resendAdapter, EmailProvider, EmailProviderId, SendDownloadEmailParams

### Community 63 - "App Error Boundary"
Cohesion: 0.22
Nodes (5): App(), COPY, ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 64 - "Checkout Hero & Language Context"
Cohesion: 0.22
Nodes (8): CheckoutHero(), CheckoutHeroProps, LanguageContext, LanguageContextValue, LanguageProvider(), persistLanguage(), TextDirection, TRANSLATIONS

### Community 65 - "Brand DNA & Design Tiers"
Cohesion: 0.22
Nodes (9): Editorial Constraints (Tier 3, EC), Non-Negotiable Principles (Tier 0, NNP), Motion Engine (behavior contracts), Brand DNA (al-Raqim thesis), Motion Engine Implementation Tokens, Motion Philosophy (Phase 1.5), Kuni Hajar (كوني هاجر) Book Preview PDF, Maha Nasr (مها نصر), Author (+1 more)

### Community 66 - "Admin Security Foundation Migration"
Cohesion: 0.33
Nodes (8): public, public.admin_audit_log, public.admin_invitations, public.current_admin_role(), public.platform_ownership, public.role_permissions, public.user_permission_overrides, public.admin_profiles

### Community 67 - "Articles Seed Generator"
Cohesion: 0.39
Nodes (7): __dirname, jsonbLiteral(), nullableTextLiteral(), OUTPUT_DIR, OUTPUT_PATH, rows, textLiteral()

### Community 68 - "Communication Theme Registry"
Cohesion: 0.32
Nodes (6): CommunicationThemePage(), DEFAULT_TOKENS, getThemePreset(), listThemePresets(), registerThemePreset(), THEME_PRESET_REGISTRY

### Community 70 - "Admin Invitation Email API"
Cohesion: 0.48
Nodes (6): absoluteUrl(), buildEmailHtml(), escapeHtml(), formatExpiry(), handler(), ROLE_LABELS

### Community 71 - "Design System Doc Lineage"
Cohesion: 0.43
Nodes (7): RAQIM Design Constitution, RAQIM Design Engine (Phase 2), RAQIM Design Foundation Review, RAQIM Design System (V1), RAQIM Foundation Design System (Phase 1), RAQIM Token Registry, RAQIM Visual Language (Phase 1.5)

### Community 72 - "NPM Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, generate-sitemap, lint, prerender-seo, preview

### Community 73 - "Kuni Hajar Product Images"
Cohesion: 0.43
Nodes (7): Book Kuni Hajar Detail, كوني هاجر (Kuni Hajar) — Book Title, ornamental cream/gold cover edition, كوني هاجر (Kuni Hajar) — Book Title, illustrated purple-cover gift edition, Kuni Hajar Collection, مها نصر (Maha Nasr) — Author, RAQIM — brand (gift box, mug, notebook packaging), Lumora About

### Community 74 - "Kuni Hajar Book Pages"
Cohesion: 0.52
Nodes (7): Maha Nasr (Author), Kuni Hajar (Book), Kuni Hajar Book Cover Illustration, Kuni Hajar Title Page, Kuni Hajar Copyright Page, Kuni Hajar Dedication Page, Kuni Hajar Author's Word Page

### Community 75 - "Invitation Trash & Permission Overrides"
Cohesion: 0.29
Nodes (4): public.restore_admin_invitation(), public.admin_profiles, public.platform_ownership, public.role_permissions

### Community 76 - "Payment Notification Email API"
Cohesion: 0.53
Nodes (5): buildEmailDocument(), escapeHtml(), formatSubmittedAt(), handler(), PAYMENT_STATUS_LABELS

### Community 77 - "Download Email API"
Cohesion: 0.60
Nodes (5): absoluteUrl(), buildEmailDocument(), escapeHtml(), formatExpiry(), handler()

### Community 78 - "Hero Scene Layered Images"
Cohesion: 0.47
Nodes (6): Layered Hero Scene (Sunrise Mountain Valley), Hero Clouds Layer, Hero Foreground Layer, Hero Golden Dust Overlay, Hero Landscape Scene, Hero Light Ray Overlay

### Community 79 - "Shape Engine & Shared Components"
Cohesion: 0.33
Nodes (6): Shape Engine (radius tokens), Radius System (Phase 1), Button.tsx Shared Component, Panel.tsx (relocated from DashboardPanel.tsx), Shape Engine Implementation Tokens, Shape Philosophy (Phase 1.5)

### Community 80 - "Settings Seed Generator"
Cohesion: 0.33
Nodes (5): __dirname, jsonLiteral, OUTPUT_DIR, OUTPUT_PATH, INITIAL_SETTINGS

### Community 81 - "Payment Notification Claims Migration"
Cohesion: 0.33
Nodes (4): public.order_notification_claims, public.set_admin_notification_preference(), public.admin_profiles, public.orders

### Community 82 - "Package Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 83 - "Raqim & Lumora Brand Images"
Cohesion: 0.50
Nodes (5): Lumora House Book Product Photo (Lavender Cover, Lotus Medallion), Lumora House (Named Entity in Filename), Raqim (Brand), Raqim Logo (Gold Lotus & Quill Emblem), Raqim-n Logo (Gold Lotus Emblem, Dark Variant)

### Community 84 - "Protected Route & Login Page"
Cohesion: 0.60
Nodes (3): ProtectedRoute(), useAuth(), AdminLoginPage()

### Community 87 - "Books Table Migration"
Cohesion: 0.40
Nodes (4): public.books, set_books_updated_at, public.categories, public.set_updated_at

### Community 89 - "Order Attachment Init API"
Cohesion: 0.67
Nodes (3): ALLOWED_MIME_TYPES, extensionFor(), handler()

### Community 90 - "Lumora Coming Soon Images"
Cohesion: 1.00
Nodes (4): Lumora (Brand/Project Name), Lumora Coming Soon Background (Gold Wax Seal, Silk), Lumora Coming Soon Message ("A New Journey Begins Soon"), Lumora Coming Soon Background (Gold Wax Seal Variant)

### Community 91 - "Raqim/Lumora Logos & OG Image"
Cohesion: 0.50
Nodes (4): Lumora Signature Logo (Gold Feather/Quill Emblem), Lumora (Brand), Raqim (رقيم) - Digital Publishing & Knowledge Platform, Raqim Platform Social Preview Image (Open Graph)

### Community 92 - "Orders Table Migration"
Cohesion: 0.50
Nodes (3): public.orders, set_orders_updated_at, public.set_updated_at

### Community 93 - "Coupons Table Migration"
Cohesion: 0.50
Nodes (3): public.coupons, set_coupons_updated_at, public.set_updated_at

### Community 94 - "Articles Table Migration"
Cohesion: 0.50
Nodes (3): public.articles, set_articles_updated_at, public.set_updated_at

### Community 97 - "Elevation Design Tokens"
Cohesion: 0.67
Nodes (3): Elevation Engine (seven levels), Elevation System (Phase 1), Elevation Engine Implementation Tokens

### Community 98 - "Spacing Design Tokens"
Cohesion: 0.67
Nodes (3): Spacing Engine (relationship tokens), Spacing Rhythm (Phase 1), Spacing Engine Implementation Tokens

### Community 99 - "Arabesque Pattern & Book Cutout"
Cohesion: 0.67
Nodes (3): Arabesque Geometric Star Pattern (Gold on Cream), Kuni Hajar Book Cover Cutout Photo, Kuni Hajar (كوني هاجر) Book Title

### Community 101 - "Kuni Hajar Back Cover"
Cohesion: 0.67
Nodes (3): قصة هاجر (Story of Hajar/Hagar - Islamic Narrative), Kuni Hajar Back Cover, كوني هاجر (Kuni Hajar - Book Title/Call to Action)

## Ambiguous Edges - Review These
- `Typography System (Phase 1)` → `Brand Typography & Color Prototype (internal research)`  [AMBIGUOUS]
  public/brand-prototype.html · relation: conceptually_related_to
- `Color Philosophy (Phase 1.5)` → `Brand Typography & Color Prototype (internal research)`  [AMBIGUOUS]
  public/brand-prototype.html · relation: conceptually_related_to
- `Lumora House Book Product Photo (Lavender Cover, Lotus Medallion)` → `Lumora House (Named Entity in Filename)`  [AMBIGUOUS]
  public/assets/Lumora House.webp · relation: references
- `Book Kuni Hajar Detail` → `Kuni Hajar Collection`  [AMBIGUOUS]
  public/assets/book-kuni-hajar-detail.webp · relation: semantically_similar_to
- `كوني هاجر (Kuni Hajar) — Book Title, ornamental cream/gold cover edition` → `كوني هاجر (Kuni Hajar) — Book Title, illustrated purple-cover gift edition`  [AMBIGUOUS]
  public/assets/book-kuni-hajar-detail.webp · relation: conceptually_related_to
- `Lumora Coming Soon Background (Gold Wax Seal, Silk)` → `Lumora (Brand/Project Name)`  [AMBIGUOUS]
  public/assets/lumora-coming-soon-01.webp · relation: references
- `Lumora Coming Soon Message ("A New Journey Begins Soon")` → `Lumora (Brand/Project Name)`  [AMBIGUOUS]
  public/assets/lumora-coming-soon-02.webp · relation: references
- `Lumora Coming Soon Background (Gold Wax Seal Variant)` → `Lumora (Brand/Project Name)`  [AMBIGUOUS]
  public/assets/lumora-coming-soon-03.webp · relation: references

## Knowledge Gaps
- **433 isolated node(s):** `ALLOWED_MIME_TYPES`, `ALLOWED_MIME_TYPES`, `ROLE_LABELS`, `PAYMENT_STATUS_LABELS`, `name` (+428 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Typography System (Phase 1)` and `Brand Typography & Color Prototype (internal research)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Color Philosophy (Phase 1.5)` and `Brand Typography & Color Prototype (internal research)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Lumora House Book Product Photo (Lavender Cover, Lotus Medallion)` and `Lumora House (Named Entity in Filename)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Book Kuni Hajar Detail` and `Kuni Hajar Collection`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `كوني هاجر (Kuni Hajar) — Book Title, ornamental cream/gold cover edition` and `كوني هاجر (Kuni Hajar) — Book Title, illustrated purple-cover gift edition`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Lumora Coming Soon Background (Gold Wax Seal, Silk)` and `Lumora (Brand/Project Name)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Lumora Coming Soon Message ("A New Journey Begins Soon")` and `Lumora (Brand/Project Name)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._