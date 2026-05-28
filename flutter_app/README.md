# PawBridge Flutter MVP

This folder contains a Flutter MVP converted from the existing shelter dashboard UI.

## Included screens

- Dashboard
- Dog profiles
- Daily care
- Documents
- Settings

## Structure

- `lib/main.dart`: app shell, navigation, and screen composition
- `lib/core/app_theme.dart`: shared colors and Material theme
- `lib/models/app_models.dart`: domain models
- `lib/data/sample_data.dart`: in-memory MVP sample data
- `lib/widgets/common.dart`: reusable cards, chips, and layout widgets

## Run

Use your terminal in `flutter_app`:

```bash
flutter pub get
flutter run
```

## Notes

- The current version is intentionally data-driven and local-only.
- Document generation is mocked as an in-app preview so you can later replace it with API or PDF generation.
- The original Next.js UI remains untouched at the repo root.
