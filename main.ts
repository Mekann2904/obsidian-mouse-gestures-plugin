// main.ts

import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	Notice,
} from "obsidian";

/* -------------------------------------------------------------------------
 * 多言語用: ラベル/説明などをまとめる辞書
 * ------------------------------------------------------------------------- */
const LANG_DICT = {
	en: {
		pluginName: "Mouse Gestures",
		settingTabName: "Mouse Gestures - Settings",
		languageLabel: "Language / 言語",
		languageDesc: "Switch between English and Japanese. / 英語と日本語を切り替えます。",

		enableDrawingLabel: "Enable drawing",
		enableDrawingDesc: "Toggle to enable or disable on-screen gesture drawing.",
		strokeColorLabel: "Stroke color",
		strokeColorDesc: "Select the color (RGB) for the gesture stroke.",
		lineWidthLabel: "Line width",
		lineWidthDesc: "Thickness of the gesture stroke.",
		gestureSensitivityLabel: "Gesture sensitivity",
		gestureSensitivityDesc: "Higher = bigger movement needed to detect direction.",
		enableMultiDirectionLabel: "Enable L-shape (multi-direction) gestures",
		enableMultiDirectionDesc: "If enabled, gestures like L-shapes (e.g. right→up) will be recognized.",
		enableDebugLogLabel: "Enable debug log",
		enableDebugLogDesc: "If enabled, logs will be shown in the console for debugging purposes.",
		showOverlayLabel: "Show overlay",
		showOverlayDesc: "If disabled, gesture overlay won't appear on the screen.",
		maxClosedTabsLabel: "Max closed tab history",
		maxClosedTabsDesc: "How many recently closed tabs to keep for U-R gesture.",

		// 新規: ナビゲーション設定
		navSettingsLabel: "Navigation settings",
		scrollTopToggleLabel: "Scroll to top",
		scrollTopToggleDesc: "Enable or disable the 'scroll to top' gesture (up).",
		historyBackToggleLabel: "History back",
		historyBackToggleDesc: "Enable or disable the 'history back' gesture (left).",
		historyForwardToggleLabel: "History forward",
		historyForwardToggleDesc: "Enable or disable the 'history forward' gesture (right).",
		closeTabToggleLabel: "Close current tab",
		closeTabToggleDesc: "Enable or disable the 'close current tab' gesture (D-R).",
		restoreTabToggleLabel: "Restore last closed tab",
		restoreTabToggleDesc: "Enable or disable the 'restore last closed tab' gesture (U-R).",
		reloadToggleLabel: "Reload",
		reloadToggleDesc: "Enable or disable the 'reload Obsidian' gesture (U-D).",
	},
	jp: {
		pluginName: "マウスジェスチャー",
		settingTabName: "マウスジェスチャー - 設定",
		languageLabel: "Language / 言語",
		languageDesc: "英語と日本語を切り替えます。 / Switch between English and Japanese.",

		enableDrawingLabel: "描画の有効化",
		enableDrawingDesc: "画面上にジェスチャー線を描画します。",
		strokeColorLabel: "ストロークの色",
		strokeColorDesc: "ジェスチャー線の色(RGB)を選択します。",
		lineWidthLabel: "線の太さ",
		lineWidthDesc: "ジェスチャー線の太さを指定します。",
		gestureSensitivityLabel: "ジェスチャー感度",
		gestureSensitivityDesc: "値が大きいほど、大きく動かさないと方向が検出されません。",
		enableMultiDirectionLabel: "L字(複数方向)の認識",
		enableMultiDirectionDesc: "右→上 など複数方向のジェスチャーを認識します。",
		enableDebugLogLabel: "デバッグログ出力",
		enableDebugLogDesc: "有効にすると、コンソールにデバッグ用ログを表示します。",
		showOverlayLabel: "オーバーレイの表示",
		showOverlayDesc: "オフにすると、画面上にジェスチャーのオーバーレイが表示されません。",
		maxClosedTabsLabel: "閉じたタブの履歴数",
		maxClosedTabsDesc: "U-R ジェスチャーで復元できるタブを何個まで保持するか指定します。",

		// 新規: ナビゲーション設定
		navSettingsLabel: "ナビゲーション設定",
		scrollTopToggleLabel: "トップへスクロール",
		scrollTopToggleDesc: "上方向(up)ジェスチャーによるトップへのスクロールを有効／無効にします。",
		historyBackToggleLabel: "履歴を戻る",
		historyBackToggleDesc: "左方向(left)ジェスチャーによるブラウザ履歴を戻るを有効／無効にします。",
		historyForwardToggleLabel: "履歴を進む",
		historyForwardToggleDesc: "右方向(right)ジェスチャーによるブラウザ履歴を進むを有効／無効にします。",
		closeTabToggleLabel: "現在のタブを閉じる",
		closeTabToggleDesc: "D-Rジェスチャーによるタブを閉じる機能を有効／無効にします。",
		restoreTabToggleLabel: "最後に閉じたタブを復元",
		restoreTabToggleDesc: "U-Rジェスチャーによる最後に閉じたタブを復元する機能を有効／無効にします。",
		reloadToggleLabel: "リロード",
		reloadToggleDesc: "U-DジェスチャーによるObsidianのリロードを有効／無効にします。",
	},
};

/* -------------------------------------------------------------------------
 * ナビゲーション用のトグル
 * ------------------------------------------------------------------------- */
interface NavigationToggles {
	enableScrollTop: boolean;
	enableHistoryBack: boolean;
	enableHistoryForward: boolean;
	enableCloseTab: boolean;
	enableRestoreTab: boolean;
	enableReload: boolean;
}

/* -------------------------------------------------------------------------
 * 設定インターフェース
 *    ※ Cmd + 右クリック のみで動かすため、
 *      enableRegularGesture / enableCmdGesture は削除
 * ------------------------------------------------------------------------- */
interface MouseGesturesSettings {
	language: "en" | "jp";

	enableDrawing: boolean;
	strokeColor: string;
	lineWidth: number;
	gestureSensitivity: number;
	enableMultiDirection: boolean;
	enableDebugLog: boolean;
	showOverlay: boolean;
	maxClosedTabHistory: number;

	navigation: NavigationToggles;
}

/* -------------------------------------------------------------------------
 * デフォルト設定
 * ------------------------------------------------------------------------- */
const DEFAULT_SETTINGS: MouseGesturesSettings = {
	language: "en",
	enableDrawing: true,
	strokeColor: "#ff0000",
	lineWidth: 4,
	gestureSensitivity: 50,
	enableMultiDirection: true,
	enableDebugLog: false,
	showOverlay: true,
	maxClosedTabHistory: 5,

	navigation: {
		enableScrollTop: true,
		enableHistoryBack: true,
		enableHistoryForward: true,
		enableCloseTab: true,
		enableRestoreTab: true,
		enableReload: false,
	},
};

/* -------------------------------------------------------------------------
 * メインのプラグインクラス
 * ------------------------------------------------------------------------- */
export default class MouseGesturesPlugin extends Plugin {
	public settings: MouseGesturesSettings;

	private canvasEl: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;

	private isDrawing = false;
	private points: { x: number; y: number }[] = [];
	private MIN_DISTANCE = 3; 

	private overlay: HTMLDivElement | null = null;
	private recognizedGesture = false;

	private startX = 0;
	private startY = 0;

	private closedTabsStack: string[] = [];

	async onload() {
		await this.loadSettings();
		this.debugLog("Loading: MouseGesturesPlugin");

		this.addSettingTab(new MouseGesturesSettingTab(this.app, this));

		// イベント登録
		this.registerDomEvent(document, "mousedown", this.onMouseDown.bind(this));
		this.registerDomEvent(document, "mousemove", this.onMouseMove.bind(this));
		this.registerDomEvent(document, "mouseup", this.onMouseUp.bind(this));
		this.registerDomEvent(document, "contextmenu", this.onContextMenu.bind(this));
	}

	onunload() {
		this.debugLog("Unloading: MouseGesturesPlugin");
		this.cleanupCanvas();
		this.removeOverlay();
	}

	/* --------------------------------------------
	 * 設定のロード／セーブ
	 * -------------------------------------------- */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/* --------------------------------------------
	 * デバッグログ
	 * -------------------------------------------- */
	private debugLog(...args: any[]) {
		if (this.settings?.enableDebugLog) {
			console.log("[MouseGestures]", ...args);
		}
	}

	/* --------------------------------------------
	 * 右クリック押下
	 * -------------------------------------------- */
	private onMouseDown(evt: MouseEvent) {
		// 右クリック以外は無視
		if (evt.button !== 2) return;

		// Cmd(またはCtrl)キーが押されていない場合はジェスチャー開始しない
		const cmdPressed = evt.metaKey || evt.ctrlKey;
		if (!cmdPressed) {
			this.debugLog("Cmd/Ctrl not pressed => do nothing.");
			return;
		}

		// アクティブなリーフがない場合はジェスチャー不可
		if (!this.isGestureAvailable()) {
			this.debugLog("Gesture not available in current context.");
			return;
		}

		// ここまで来たら Cmd+右クリック ジェスチャー開始
		this.debugLog("Cmd+Right mouse down => start gesture tracking");
		this.recognizedGesture = false;
		this.isDrawing = true;

		this.points = [{ x: evt.clientX, y: evt.clientY }];
		this.startX = evt.clientX;
		this.startY = evt.clientY;

		if (this.settings.enableDrawing) {
			this.setupCanvas();
			if (this.ctx) {
				this.ctx.beginPath();
				this.ctx.moveTo(evt.clientX, evt.clientY);
			}
		}
	}

	/* --------------------------------------------
	 * マウス移動
	 * -------------------------------------------- */
	private onMouseMove(evt: MouseEvent) {
		if (!this.isDrawing) return;
		if (!this.isGestureAvailable()) return;

		const lastPoint = this.points[this.points.length - 1];
		const dist = this.getDistance(lastPoint.x, lastPoint.y, evt.clientX, evt.clientY);

		if (dist >= this.MIN_DISTANCE) {
			this.points.push({ x: evt.clientX, y: evt.clientY });

			if (this.ctx && this.settings.enableDrawing) {
				this.ctx.lineTo(evt.clientX, evt.clientY);
				this.ctx.stroke();
			}
		}
	}

	/* --------------------------------------------
	 * マウスボタンを離した
	 * -------------------------------------------- */
	private onMouseUp(evt: MouseEvent) {
		// 右クリック以外 or ジェスチャー中でない場合は無視
		if (evt.button !== 2 || !this.isDrawing) return;

		this.isDrawing = false;
		const totalDist = this.getDistance(this.startX, this.startY, evt.clientX, evt.clientY);
		this.debugLog("onMouseUp totalDist=", totalDist);

		if (totalDist > this.settings.gestureSensitivity) {
			const directions = this.analyzePath(this.points);
			const finalGesture = this.inferGesture(directions);
			this.debugLog("Directions:", directions, "-> final:", finalGesture);

			const success = this.executeGesture(finalGesture);
			this.recognizedGesture = success;
		} else {
			this.debugLog("Movement too small => normal context menu");
			this.recognizedGesture = false;
		}

		this.cleanupCanvas();
		this.points = [];
	}

	/* --------------------------------------------
	 * contextmenu (右クリックメニュー)
	 * -------------------------------------------- */
	private onContextMenu(evt: MouseEvent) {
		// ジェスチャーと判定された場合のみメニューをブロック
		if (evt.button === 2 && this.recognizedGesture) {
			this.debugLog("Context menu blocked (recognized gesture).");
			evt.preventDefault();
			evt.stopPropagation();
		} else {
			this.debugLog("Context menu allowed.");
		}
	}

	/* --------------------------------------------
	 * アクティブリーフがあるかどうか
	 * -------------------------------------------- */
	private isGestureAvailable(): boolean {
		const activeLeaf = this.app.workspace.activeLeaf;
		return !!activeLeaf;
	}

	/* --------------------------------------------
	 * 描画用キャンバスのセットアップ
	 * -------------------------------------------- */
	private setupCanvas() {
		this.cleanupCanvas();
		this.canvasEl = document.createElement("canvas");
		this.canvasEl.style.position = "fixed";
		this.canvasEl.style.left = "0";
		this.canvasEl.style.top = "0";
		this.canvasEl.width = window.innerWidth;
		this.canvasEl.height = window.innerHeight;
		this.canvasEl.style.zIndex = "9999";
		document.body.appendChild(this.canvasEl);

		this.ctx = this.canvasEl.getContext("2d") as CanvasRenderingContext2D;
		if (this.ctx) {
			this.ctx.strokeStyle = this.settings.strokeColor;
			this.ctx.lineWidth = this.settings.lineWidth;
			this.ctx.lineJoin = "round";
			this.ctx.lineCap = "round";
		}
	}

	/* --------------------------------------------
	 * キャンバスを破棄
	 * -------------------------------------------- */
	private cleanupCanvas() {
		if (this.canvasEl) {
			document.body.removeChild(this.canvasEl);
			this.canvasEl = null;
		}
		this.ctx = null;
	}

	/* --------------------------------------------
	 * 方向解析
	 * -------------------------------------------- */
	private analyzePath(points: { x: number; y: number }[]): ("up" | "down" | "left" | "right")[] {
		if (points.length < 2) return [];

		const result: ("up" | "down" | "left" | "right")[] = [];
		for (let i = 0; i < points.length - 1; i++) {
			const p1 = points[i];
			const p2 = points[i + 1];

			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			const angle = Math.atan2(dy, dx);
			const deg = (angle * 180) / Math.PI;

			let dir: "up" | "down" | "left" | "right";
			if (deg >= -45 && deg < 45) {
				dir = "right";
			} else if (deg >= 45 && deg < 135) {
				dir = "down";
			} else if (deg >= -135 && deg < -45) {
				dir = "up";
			} else {
				dir = "left";
			}
			result.push(dir);
		}

		// 同じ方向をまとめる
		const simplified: ("up" | "down" | "left" | "right")[] = [];
		for (let i = 0; i < result.length; i++) {
			if (i === 0 || result[i] !== result[i - 1]) {
				simplified.push(result[i]);
			}
		}
		return simplified;
	}

	/* --------------------------------------------
	 * 方向配列 => ジェスチャー文字列
	 * -------------------------------------------- */
	private inferGesture(dirs: ("up" | "down" | "left" | "right")[]): string {
		if (!dirs.length) return "";

		if (!this.settings.enableMultiDirection || dirs.length === 1) {
			return dirs[0];
		}
		// 先頭2方向を組み合わせる
		return dirs[0][0].toUpperCase() + "-" + dirs[1][0].toUpperCase();
	}

	/* --------------------------------------------
	 * ジェスチャーを実行
	 * -------------------------------------------- */
	private executeGesture(finalGesture: string): boolean {
		if (!finalGesture) {
			this.debugLog("No gesture recognized => do nothing");
			return false;
		}
		const nav = this.settings.navigation;

		// 単方向
		switch (finalGesture) {
			case "up": {
				if (!nav.enableScrollTop) {
					this.debugLog("Scroll top gesture disabled.");
					return false;
				}
				this.debugLog("Gesture: up => Scroll top");
				this.showOverlayIfNeeded("↑", "Scroll top");
				this.scrollToTop();
				return true;
			}
			case "left": {
				if (!nav.enableHistoryBack) {
					this.debugLog("History back gesture disabled.");
					return false;
				}
				this.debugLog("Gesture: left => History back");
				this.showOverlayIfNeeded("←", "History back");
				window.history.back();
				return true;
			}
			case "right": {
				if (!nav.enableHistoryForward) {
					this.debugLog("History forward gesture disabled.");
					return false;
				}
				this.debugLog("Gesture: right => History forward");
				this.showOverlayIfNeeded("→", "History forward");
				window.history.forward();
				return true;
			}
		}

		// 2方向
		switch (finalGesture) {
			case "U-R": {
				if (!nav.enableRestoreTab) {
					this.debugLog("Restore tab gesture disabled.");
					return false;
				}
				this.debugLog("Gesture: U-R => Restore last closed tab");
				this.showOverlayIfNeeded("U-R", "Restore last closed tab");
				this.restoreClosedTabInNewTab();
				return true;
			}
			case "D-R": {
				if (!nav.enableCloseTab) {
					this.debugLog("Close tab gesture disabled.");
					return false;
				}
				this.debugLog("Gesture: D-R => Close current tab");
				this.showOverlayIfNeeded("D-R", "Close current tab");
				this.closeCurrentTab();
				return true;
			}
			case "U-D": {
				if (!nav.enableReload) {
					this.debugLog("Reload gesture disabled.");
					return false;
				}
				this.debugLog("Gesture: U-D => Reload");
				this.showOverlayIfNeeded("U-D", "Reload");
				this.reloadObsidian();
				return true;
			}
			default: {
				this.debugLog(`Unknown gesture "${finalGesture}" => do nothing`);
				return false;
			}
		}
	}

	/* --------------------------------------------
	 * スクロール最上部へ移動
	 * -------------------------------------------- */
	private scrollToTop() {
		const leaf = this.app.workspace.activeLeaf;
		if (leaf && leaf.view instanceof MarkdownView) {
			leaf.view.currentMode.applyScroll(0);
		}
	}

	/* --------------------------------------------
	 * タブを閉じる
	 * -------------------------------------------- */
	private closeCurrentTab() {
		const leaf = this.app.workspace.activeLeaf;
		if (!leaf) {
			new Notice("No active tab to close.");
			return;
		}
		const viewState = leaf.getViewState();
		const filePath = viewState?.state?.file;
		if (filePath && typeof filePath === "string") {
			// タブ履歴に追加
			this.closedTabsStack.push(filePath);
			if (this.closedTabsStack.length > this.settings.maxClosedTabHistory) {
				this.closedTabsStack.shift();
			}
		}
		leaf.detach();
	}

	/* --------------------------------------------
	 * 最後に閉じたタブを復元
	 * -------------------------------------------- */
	private restoreClosedTabInNewTab() {
		if (this.closedTabsStack.length === 0) {
			new Notice("No closed tab to restore.");
			return;
		}
		const filePath = this.closedTabsStack.pop()!;
		this.app.workspace.openLinkText(filePath, "", true);
	}

	/* --------------------------------------------
	 * Obsidian再読み込み
	 * -------------------------------------------- */
	private reloadObsidian() {
		const cmdId = "app:reload";
		const allCommands: any = (this.app as any).commands?.commands;
		if (allCommands && allCommands[cmdId]) {
			this.debugLog("Reloading via Obsidian command: app:reload");
			(this.app as any).commands.executeCommandById(cmdId);
		} else {
			this.debugLog("Obsidian command not found, fallback to location.reload()");
			location.reload();
		}
	}

	/* --------------------------------------------
	 * オーバーレイ表示
	 * -------------------------------------------- */
	private showOverlayIfNeeded(symbol: string, label: string) {
		if (!this.settings.showOverlay) return;
		this.showGestureOverlay(symbol, label);
	}

	private showGestureOverlay(symbol: string, label: string) {
		this.removeOverlay();

		this.overlay = document.createElement("div");
		this.overlay.style.position = "fixed";
		this.overlay.style.top = "50%";
		this.overlay.style.left = "50%";
		this.overlay.style.transform = "translate(-50%, -50%)";
		this.overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
		this.overlay.style.color = "#fff";
		this.overlay.style.padding = "12px 24px";
		this.overlay.style.borderRadius = "8px";
		this.overlay.style.zIndex = "9999";
		this.overlay.style.fontSize = "1.2em";
		this.overlay.style.textAlign = "center";

		const arrowEl = document.createElement("div");
		arrowEl.style.fontSize = "1.5em";
		arrowEl.textContent = symbol;
		this.overlay.appendChild(arrowEl);

		const textEl = document.createElement("div");
		textEl.textContent = label;
		this.overlay.appendChild(textEl);

		document.body.appendChild(this.overlay);

		window.setTimeout(() => {
			this.removeOverlay();
		}, 1500);
	}

	private removeOverlay() {
		if (this.overlay) {
			document.body.removeChild(this.overlay);
			this.overlay = null;
		}
	}

	/* --------------------------------------------
	 * 2点間の距離
	 * -------------------------------------------- */
	private getDistance(x1: number, y1: number, x2: number, y2: number): number {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	}
}

/* -------------------------------------------------------------------------
 * 設定タブ
 *  - 通常の右クリックジェスチャーやCmdジェスチャーのON/OFFは削除
 * ------------------------------------------------------------------------- */
class MouseGesturesSettingTab extends PluginSettingTab {
	plugin: MouseGesturesPlugin;

	constructor(app: App, plugin: MouseGesturesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const lang = this.plugin.settings.language;
		const t = LANG_DICT[lang];

		containerEl.empty();
		containerEl.createEl("h2", { text: t.pluginName });

		/* -------------------------------
		 * 言語切り替え
		 * ------------------------------- */
		new Setting(containerEl)
			.setName(LANG_DICT.en.languageLabel + " / " + LANG_DICT.jp.languageLabel)
			.setDesc(LANG_DICT.en.languageDesc + " / " + LANG_DICT.jp.languageDesc)
			.addToggle((toggle) => {
				toggle.setValue(lang === "jp");
				toggle.onChange((value) => {
					this.plugin.settings.language = value ? "jp" : "en";
					this.plugin.saveSettings().then(() => {
						this.display(); // 再描画
					});
				});
			});

		/* -------------------------------
		 * 描画設定
		 * ------------------------------- */
		new Setting(containerEl)
			.setName(t.enableDrawingLabel)
			.setDesc(t.enableDrawingDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDrawing)
					.onChange(async (val) => {
						this.plugin.settings.enableDrawing = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.strokeColorLabel)
			.setDesc(t.strokeColorDesc)
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.strokeColor)
					.onChange(async (val) => {
						this.plugin.settings.strokeColor = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.lineWidthLabel)
			.setDesc(t.lineWidthDesc)
			.addSlider((slider) => {
				slider
					.setLimits(1, 20, 1)
					.setValue(this.plugin.settings.lineWidth)
					.setDynamicTooltip()
					.onChange(async (val) => {
						this.plugin.settings.lineWidth = val;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t.gestureSensitivityLabel)
			.setDesc(t.gestureSensitivityDesc)
			.addSlider((slider) => {
				slider
					.setLimits(10, 300, 5)
					.setValue(this.plugin.settings.gestureSensitivity)
					.setDynamicTooltip()
					.onChange(async (val) => {
						this.plugin.settings.gestureSensitivity = val;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t.enableMultiDirectionLabel)
			.setDesc(t.enableMultiDirectionDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableMultiDirection)
					.onChange(async (val) => {
						this.plugin.settings.enableMultiDirection = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.enableDebugLogLabel)
			.setDesc(t.enableDebugLogDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDebugLog)
					.onChange(async (val) => {
						this.plugin.settings.enableDebugLog = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.showOverlayLabel)
			.setDesc(t.showOverlayDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showOverlay)
					.onChange(async (val) => {
						this.plugin.settings.showOverlay = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.maxClosedTabsLabel)
			.setDesc(t.maxClosedTabsDesc)
			.addSlider((slider) => {
				slider
					.setLimits(1, 20, 1)
					.setValue(this.plugin.settings.maxClosedTabHistory)
					.setDynamicTooltip()
					.onChange(async (val) => {
						this.plugin.settings.maxClosedTabHistory = val;
						await this.plugin.saveSettings();
					});
			});

		/* -------------------------------
		 * ナビゲーション設定
		 * ------------------------------- */
		containerEl.createEl("h3", { text: t.navSettingsLabel });

		new Setting(containerEl)
			.setName(t.scrollTopToggleLabel)
			.setDesc(t.scrollTopToggleDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.navigation.enableScrollTop)
					.onChange(async (val) => {
						this.plugin.settings.navigation.enableScrollTop = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.historyBackToggleLabel)
			.setDesc(t.historyBackToggleDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.navigation.enableHistoryBack)
					.onChange(async (val) => {
						this.plugin.settings.navigation.enableHistoryBack = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.historyForwardToggleLabel)
			.setDesc(t.historyForwardToggleDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.navigation.enableHistoryForward)
					.onChange(async (val) => {
						this.plugin.settings.navigation.enableHistoryForward = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.closeTabToggleLabel)
			.setDesc(t.closeTabToggleDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.navigation.enableCloseTab)
					.onChange(async (val) => {
						this.plugin.settings.navigation.enableCloseTab = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.restoreTabToggleLabel)
			.setDesc(t.restoreTabToggleDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.navigation.enableRestoreTab)
					.onChange(async (val) => {
						this.plugin.settings.navigation.enableRestoreTab = val;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.reloadToggleLabel)
			.setDesc(t.reloadToggleDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.navigation.enableReload)
					.onChange(async (val) => {
						this.plugin.settings.navigation.enableReload = val;
						await this.plugin.saveSettings();
					}),
			);
	}
}
