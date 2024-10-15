# WeBWorK AlphaLinK
WeBWorK AlphaLinK is a Manifest-V3 Chrome Web Extension full of quality-of-life improvements and feature enhancements for the online homework system [WeBWorK](https://webwork.maa.org/wiki/Introduction).

The aim of this software is to provide a seamless user experience by streamlining interactions and navigation, enabling students to concentrate fully on their homework and learning.

## Functionality
### QoL Improvements:
- Various enhanced UI elements
- Course page 'Score' and 'Problems' columns 
- Problem set page completion indicators
- Countless keyboard shortcuts
### Features:
- Navigate between classes in two clicks
- Open questions directly in Wolfram|Alpha
- Automatic parenthesis pairing
- Toggleable sidebar featuring:
  - Wolfram|Alpha
  - Symbolab
  - Desmos
  - Desmos 3D
  - Piazza
- GUI to enable/disable features

## Installation
### Add to Chrome (Recommended)
This extension is ~~available~~ for chromium-based browsers on the [Chrome Web Store](https://github.com/munr0/WeBWorK-AlphaLinK). *–currently in the process of being submitted for review–*

### Manual Installation
1. Clone the repo or download [just the /src](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fmunr0%2FWeBWorK-AlphaLinK%2Ftree%2Fmain%2Fsrc)
   - unzip the `src` folder if applicable
1. Follow this [video](https://www.youtube.com/watch?v=dhaGRJvJAII&t=64s) or the steps below
   1. Go to `chrome://extensions/`
   1. Enable `developer mode` in the top-right
   1. Click `load unpacked` in the top-left
   1. Select the downloaded `src` folder
   1. The extension should now appear in the extension menu
1. (Optional) – Pin the extension for easy access by clicking the 🧩 in the top-right corner of your browser and hitting the 📌 next to the extension.

## Usage
*–add popup.html and demo video–*<br><br>

| Without Extension | With Extension |
| --- | --- |
| ![image](https://github.com/user-attachments/assets/587740ad-95cd-4219-b97a-3877a2cd3d5a) | ![image](https://github.com/user-attachments/assets/abbc7cc9-9fe8-467c-965e-d34599091985) |
| ![image](https://github.com/user-attachments/assets/6ff908c1-92b4-494d-85de-aef9419badfb) | ![image](https://github.com/user-attachments/assets/7d5a01d6-288c-4b40-952b-f6cfaa4f7d1a) |

## Planned Features
- Working 'Sidebar Scale' setting
- 'Time Remaining' column on course page
- Proper matrix/vector TeX interpretation for W|A
- Rename and remove classes on the popup
