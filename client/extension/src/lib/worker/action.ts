import { ActionType } from "../ui/utils/types";

class ActionExecutor {
  tabId: number;
  actions?: Action[];
  waitAfterClick: number;
  waitAfterKeystroke: number;

  constructor(tabId: number, actions?: Action[]) {
    this.tabId = tabId;
    this.actions = actions;
    this.waitAfterClick = 300; // ms
    this.waitAfterKeystroke = 15; // ms
  }

  async executeActions() {
    for (const action of this.actions) {
      await this.executeAction(action);
      await this.wait(50);
    }
    return this.tabId;
  }

  async executeAction(action) {
    const actionHandlers = {
      click: () => this.performClick(action),
      input: () => this.performType(action),
      goto_url: () => this.gotoUrl(action.value),
      enter: () => this.performEnter(),
    };

    const handler = actionHandlers[action.action_type];
    if (handler) {
      await handler();
    } else {
      console.warn(`Unsupported action type: ${action.action_type}`);
      return;
    }
  }

  async performClick(action) {
    const nodeId = action.node_id;
    const objectId = await this.findObjectIdByAttribute(nodeId);
    const { x, y } = await this.getElementCenterCoordinates(objectId);
    await this.dispatchMouseEvent("mousePressed", x, y);
    await this.dispatchMouseEvent("mouseReleased", x, y);
    await this.sendActionToClientForCursorAnimation(x, y, action);
  }

  async performType(action) {
    const { node_id: nodeId, value, pressEnter } = action || {};
    await this.performClick(action);
    await this.wait(this.waitAfterClick);
    for (const char of value) {
      await this.dispatchKeyEvent("keyDown", char);
      await this.wait(this.waitAfterKeystroke);
      await this.dispatchKeyEvent("keyUp", char);
      await this.wait(this.waitAfterKeystroke);
    }
    if (pressEnter) {
      await this.performEnter();
    }

    const objectId = await this.findObjectIdByAttribute(nodeId);
    const { x, y } = await this.getElementCenterCoordinates(objectId);
    await this.sendActionToClientForCursorAnimation(x, y, action);
  }

  async performEnter() {
    await this.sendKeyboardEvent("keydown", 13, false, false, false, false);
    await this.wait(this.waitAfterKeystroke);
    await this.sendKeyboardEvent("keypress", 13, false, false, false, false);
    await this.wait(this.waitAfterKeystroke);
    await this.sendKeyboardEvent("keyup", 13, false, false, false, false);
    await this.wait(this.waitAfterKeystroke);
  }

  async gotoUrl(url) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url }, (tab) => {
        this.tabId = tab.id;
        const currentTabId = this.tabId;
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === currentTabId && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(void 0);
          }
        });
      });
    });
  }

  async sendActionToClientForCursorAnimation(x, y, action) {
    await chrome.tabs.sendMessage(this.tabId, {
      actionType: ActionType.ANIMATE_CURSOR,
      payload: {
        action,
        x,
        y,
      },
    });
  }

  async captureScreenshot() {
    const screenshot = (await this.sendDebuggerCommand(
      "Page.captureScreenshot",
      {
        format: "png",
        quality: 10,
      }
    )) as any;
    return `data:image/png;base64,${screenshot.data}`;
  }

  async findObjectIdByAttribute(attributeId) {
    console.log("findObjectIdByAttribute", attributeId);
    const document = (await this.sendDebuggerCommand("DOM.getDocument")) as any;
    const queryResult = (await this.sendDebuggerCommand("DOM.querySelector", {
      nodeId: document.root.nodeId,
      selector: `[aie-id="${attributeId}"]`,
    })) as any;
    if (!queryResult.nodeId) throw new Error("Element not found");

    const resolvedNode = (await this.sendDebuggerCommand("DOM.resolveNode", {
      nodeId: queryResult.nodeId,
    })) as any;
    if (!resolvedNode.object.objectId) throw new Error("Object not found");

    return resolvedNode.object.objectId;
  }

  async getElementCenterCoordinates(objectId) {
    const boxModel = (await this.sendDebuggerCommand("DOM.getBoxModel", {
      objectId,
    })) as any;
    const [x1, y1, , , x3, y3] = boxModel.model.border;
    return { x: (x1 + x3) / 2, y: (y1 + y3) / 2 };
  }

  async dispatchMouseEvent(type, x, y) {
    await this.sendDebuggerCommand("Input.dispatchMouseEvent", {
      type,
      x,
      y,
      button: "left",
      clickCount: 1,
    });
  }

  async dispatchKeyEvent(type, char) {
    await this.sendDebuggerCommand("Input.dispatchKeyEvent", {
      type: type === "keyDown" ? "keyDown" : "keyUp",
      text: char,
    });
  }

  async sendKeyboardEvent(type, charCode, shift, alt, ctrl, cmd) {
    var text = "";

    switch (type) {
      case "keyup":
        type = "keyUp";
        break;
      case "keydown":
        type = "rawKeyDown";
        break;
      case "keypress":
        type = "char";
        text = String.fromCharCode(charCode);
        break;
      default:
        throw new Error("Unknown type of event.");
        break;
    }

    var modifiers = 0;
    if (shift) {
      modifiers += 8;
    }
    if (alt) {
      modifiers += 1;
    }
    if (ctrl) {
      modifiers += 2;
    }
    if (cmd) {
      modifiers += 4;
    }

    this.sendDebuggerCommand("Input.dispatchKeyEvent", {
      type,
      windowsVirtualKeyCode: charCode,
      modifiers: modifiers,
      text: text,
    });
  }

  async sendDebuggerCommand(command, params = {}) {
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand(
        { tabId: this.tabId },
        command,
        params,
        (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

enum BrowserActionType {
  click = "click",
  scroll_up = "scroll_up",
  scroll_down = "scroll_down",
  input = "input",
  select = "select",
  hover = "hover",
  focus = "focus",
  visit = "visit",
  enter = "enter",
  key_down = "key_down",
  summarize = "summarize",
  task_complete = "task_complete",
  answer = "answer",
  chat = "chat",
  stuck = "stuck",
  translate = "translate",
  code_generation = "code_generation",
  goto_url = "goto_url",
  extract_and_store_info_for_next_task = "extract_and_store_info_for_next_task",
}

interface Action {
  action_type: BrowserActionType;
  search_term_to_find_this_element?: string;
  value?: string;
  node_id?: number;
  thought_process?: string;
  block_ids?: string;
  pressEnter?: boolean;
}

export default ActionExecutor;
