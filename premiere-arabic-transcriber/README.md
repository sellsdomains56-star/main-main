# Arabic Transcriber for Premiere Pro

<p dir="rtl" lang="ar">إضافة لبرنامج أدوبي بريميير تحوّل الكلام العربي في التسلسل إلى ترجمة مكتوبة يمكنك تعديلها ثم إضافتها إلى الخط الزمني.</p>

A Premiere Pro panel that turns Arabic speech in your sequence into Arabic captions you can edit.

1. **Exports the audio** of the active sequence: the In-to-Out range, or the whole sequence if no In/Out is set.
2. **Transcribes it as Arabic** with Whisper, either online (OpenAI or Groq) or offline on your computer (whisper.cpp).
3. **Shows the transcript** so you can fix any mistakes. Click a time to move the playhead there.
4. **Adds it to the sequence** as a caption track. You can also add it as sequence markers, save an `.srt` file, or copy the plain text.

Captions are split into readable lines (42 characters and 2 lines by default) with even line lengths, and breaks fall after punctuation where possible. Each caption's timing is spread across its segment by text length. The panel drops lines Whisper is known to make up over silence or music, such as «ترجمة نانسي قنقر».

## Requirements

- Adobe Premiere Pro 2020 or later, on Windows or macOS.
  Recent versions get a caption track added automatically. On versions that can't do this from a panel, the SRT is imported into an **Arabic Transcripts** bin and you drag it onto the timeline yourself.
- One way to run speech recognition:
  - an **OpenAI** API key ([platform.openai.com](https://platform.openai.com/api-keys)), or
  - a **Groq** API key ([console.groq.com](https://console.groq.com/keys)), or
  - **whisper.cpp** and a model file, to work offline (see below).

Nothing else is needed. You don't need ffmpeg or Python: audio conversion happens inside the panel.

## Install

1. Download the repository (on GitHub: **Code › Download ZIP**), unzip it, and open the `premiere-arabic-transcriber` folder.
2. Run the installer for your system:
   - **macOS:** in Terminal, run `bash scripts/install-mac.sh` from inside the folder.
   - **Windows:** double-click `scripts\install-windows.bat`.
3. Restart Premiere Pro, then open **Window › Extensions › Arabic Transcriber**.

The installer copies the panel to your user's CEP extensions folder and turns on `PlayerDebugMode`, which lets Premiere load panels that aren't packaged as a signed `.zxp`. To do the same by hand:

| | Extensions folder | Allow unsigned panels |
| --- | --- | --- |
| macOS | `~/Library/Application Support/Adobe/CEP/extensions/` | `defaults write com.adobe.CSXS.12 PlayerDebugMode 1` (repeat for 9, 10, 11, 13) |
| Windows | `%APPDATA%\Adobe\CEP\extensions\` | Registry: `HKEY_CURRENT_USER\Software\Adobe\CSXS.12`, string value `PlayerDebugMode` = `1` (repeat for 9, 10, 11, 13) |

## Set up speech recognition

Open **Settings** at the bottom of the panel.

### Online (easiest)

- **OpenAI:** choose *OpenAI* and paste your API key. The model is `whisper-1`.
- **Groq:** choose *Groq* and paste your Groq key. The model is `whisper-large-v3`, a newer Whisper model that is often more accurate on Arabic, and fast.
- **Any other OpenAI-compatible server**, such as a self-hosted faster-whisper server: choose *Other* and enter its URL and model.

The model has to return segment timings (`verbose_json`), because captions are built from them. Text-only models such as `gpt-4o-transcribe` won't work, and the panel tells you if you pick one.

Long sequences are sent in parts of about 10 minutes, each under the 25 MB upload limit. Parts are cut at pauses so no word is split. Billing is per minute of audio, so check your provider's pricing.

### Offline with whisper.cpp

Everything stays on your computer. It's free, but slower without a fast GPU (Apple Silicon Macs are fast).

1. Get the program:
   - **macOS:** `brew install whisper-cpp`. The program is `/opt/homebrew/bin/whisper-cli` (or `/usr/local/bin/whisper-cli` on Intel Macs).
   - **Windows:** download `whisper-bin-x64.zip` from the [whisper.cpp releases](https://github.com/ggml-org/whisper.cpp/releases), unzip it, and use `whisper-cli.exe` (called `main.exe` in older builds).
2. Download a model from [huggingface.co/ggerganov/whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp/tree/main):
   - `ggml-large-v3.bin` (about 3 GB) is the most accurate for Arabic.
   - `ggml-large-v3-turbo.bin` (about 1.6 GB) is much faster and a little less accurate.
   - Smaller models (base, small) make many mistakes in Arabic.
3. In Settings, choose **Offline on this computer**, then pick the program and the model file. On macOS the file dialog hides `/opt`, so paste the path into the box instead.

## Using it

1. Open your sequence. To transcribe only part of it, set In and Out points.
2. Click **Transcribe Arabic speech**. Premiere pauses for a moment while it renders the audio.
3. Read through the result and correct anything that's wrong. Click × to delete a line.
4. Click **Add captions to sequence**. The SRT is saved in an `Arabic Transcripts` folder next to your project file (or in `Documents/Arabic Transcripts` if the project is unsaved), and it's imported into an **Arabic Transcripts** bin.

Tips:

- **Names and terms:** type people's names, places and brand names in Settings › *Names and terms*. Whisper then spells them the way you want.
- **Dialects:** Whisper understands Gulf, Egyptian, Levantine and other dialects, but tends to write them in more standard spelling. Check those lines.
- **Mixed Arabic and English:** set Language to *Detect automatically*.
- Your last transcript is kept if you close the panel.

## Arabic in Premiere's captions

- **Letters look disconnected or in the wrong order:** in Premiere's Preferences (called Settings on macOS in newer versions) › **Graphics**, set **Text Engine** to **South Asian and Middle Eastern**. Then use an Arabic font in the caption style, such as Dubai, Noto Naskh Arabic, Geeza Pro or Tahoma.
- **Punctuation shows up at the wrong end of the line:** turn on *Add right-to-left marks* under Settings › Captions, then add the captions again.
- **Diacritics (tashkeel):** turn on *Remove diacritics* if you want plain text.

## Troubleshooting

- **The panel isn't in Window › Extensions:** run the installer again and fully restart Premiere. If your Premiere uses a newer CEP version than 13, set `PlayerDebugMode` for that number too.
- **"Could not find a WAV export preset":** in Premiere, open **File › Export › Media**, set Format to **Waveform Audio**, and save it as a preset. Then pick that `.epr` file under Settings › *Audio export preset*. Saved presets are in `Documents/Adobe/Adobe Media Encoder/<version>/Presets/`.
- **"The sequence audio is silent":** check that the audio tracks aren't muted and that the In/Out range has sound.
- **"The API key was rejected":** check the key, and that the Service setting matches where the key is from.
- **Debugging:** while Premiere is running, open `http://localhost:8098` in Chrome to see the panel's console.

## Privacy

- **Online engines:** your sequence's audio is uploaded to the provider you chose. Your API key is saved only in the panel's local storage on this computer.
- **Offline mode:** nothing leaves your computer.

## How it works

| File | What it does |
| --- | --- |
| `CSXS/manifest.xml` | Registers the panel with Premiere Pro (CEP extension). |
| `host/index.jsx` | ExtendScript inside Premiere: renders the sequence audio to WAV, imports the SRT, creates the caption track, adds markers and moves the playhead. |
| `js/lib/wav.js` | Mixes the WAV down to 16 kHz mono and cuts it into parts at pauses. |
| `js/lib/engines.js` | The OpenAI-compatible API client and the whisper.cpp runner. |
| `js/lib/captions.js` | Arabic text cleanup, hallucination filter, caption line splitting, SRT output. |
| `js/main.js`, `index.html`, `css/panel.css` | The panel UI. |

## Development

```
node test/run-tests.js
```

The tests cover audio conversion and cutting, caption building, both engines (against a mock API server and a stand-in whisper.cpp), and `host/index.jsx` running against a mocked Premiere scripting model. Edit the files in your CEP extensions folder, or symlink this folder there, then close and reopen the panel to reload it.
