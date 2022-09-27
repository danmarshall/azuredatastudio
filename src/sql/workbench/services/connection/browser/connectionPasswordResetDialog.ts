/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/errorMessageDialog';
import { Button } from 'sql/base/browser/ui/button/button';
import { HideReason, Modal } from 'sql/workbench/browser/modal/modal';
import * as TelemetryKeys from 'sql/platform/telemetry/common/telemetryKeys';

import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Event, Emitter } from 'vs/base/common/event';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { localize } from 'vs/nls';
import { IAction } from 'vs/base/common/actions';
import * as DOM from 'vs/base/browser/dom';
import { ILogService } from 'vs/platform/log/common/log';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfigurationService';
import { IAdsTelemetryService } from 'sql/platform/telemetry/common/telemetry';
import { attachModalDialogStyler } from 'sql/workbench/common/styler';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { attachButtonStyler } from 'vs/platform/theme/common/styler';

const maxActions = 1;

const passwordResetMessage: string = localize('connectionPasswordResetDialog.message', 'Password for this username has expired, enter a new password in order to login.');

export class ConnectionPasswordResetDialog extends Modal {

	private _body?: HTMLElement;
	private _okButton?: Button;
	private _copyButton?: Button;
	private _actionButtons: Button[] = [];
	private _actions: IAction[] = [];
	private _messageDetails?: string;
	private _okLabel: string;
	private _closeLabel: string;

	private _onOk = new Emitter<void>();
	public onOk: Event<void> = this._onOk.event;

	constructor(
		@IThemeService themeService: IThemeService,
		@IClipboardService clipboardService: IClipboardService,
		@ILayoutService layoutService: ILayoutService,
		@IAdsTelemetryService telemetryService: IAdsTelemetryService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ILogService logService: ILogService,
		@ITextResourcePropertiesService textResourcePropertiesService: ITextResourcePropertiesService
	) {
		super('', TelemetryKeys.ModalDialogName.ErrorMessage, telemetryService, layoutService, clipboardService, themeService, logService, textResourcePropertiesService, contextKeyService, { dialogStyle: 'normal', hasTitleIcon: true });
		this._okLabel = localize('ConnectionPasswordResetDialog.ok', "OK");
		this._closeLabel = localize('ConnectionPasswordResetDialog.close', "Close");
	}

	protected renderBody(container: HTMLElement) {
		this._body = DOM.append(container, DOM.$('div.password-reset-dialog'));
	}

	public override render() {
		super.render();
		this._register(attachModalDialogStyler(this, this._themeService));
		this._actionButtons = [];
		for (let i = 0; i < maxActions; i++) {
			this._actionButtons.unshift(this.createStandardButton(localize('ConnectionPasswordResetDialog.action', "Action"), () => this.onActionSelected(i)));
		}
		this._okButton = this.addFooterButton(this._okLabel, () => this.ok());
		this._register(attachButtonStyler(this._okButton, this._themeService));
	}

	private createStandardButton(label: string, onSelect: () => void): Button {
		let button = this.addFooterButton(label, onSelect, 'right', true);
		this._register(attachButtonStyler(button, this._themeService));
		return button;
	}

	private onActionSelected(index: number): void {
		// Call OK so it always closes
		this.ok();
		// Run the action if possible
		if (this._actions && index < this._actions.length) {
			this._actions[index].run();
		}
	}

	protected layout(height?: number): void {
		// Nothing to re-layout
	}

	private updateDialogBody(): void {
		DOM.clearNode(this._body!);
		DOM.append(this._body!, DOM.$('div.password-reset-message')).innerText = passwordResetMessage!;
	}

	/* espace key */
	protected override onClose() {
		this.ok();
	}

	/* enter key */
	protected override onAccept() {
		this.ok();
	}

	public ok(): void {
		this._onOk.fire();
		this.close('ok');
	}

	public close(hideReason: HideReason = 'close') {
		this.hide(hideReason);
	}

	public open(username: string, headerTitle: string, message: string, messageDetails?: string, actions?: IAction[]) {
		this.title = headerTitle;
		this._messageDetails = messageDetails;
		if (this._messageDetails) {
			this._copyButton!.element.style.visibility = 'visible';
		} else {
			this._copyButton!.element.style.visibility = 'hidden';
		}
		this._bodyContainer.setAttribute('aria-description', passwordResetMessage);
		this.resetActions();
		if (actions && actions.length > 0) {
			for (let i = 0; i < maxActions && i < actions.length; i++) {
				this._actions.push(actions[i]);
				let button = this._actionButtons[i];
				button.label = actions[i].label;
				button.element.style.visibility = 'visible';
			}
			this._okButton!.label = this._closeLabel;
		} else {
			this._okButton!.label = this._okLabel;
		}
		this.titleIconClassName = 'sql password reset';
		this.updateDialogBody();
		this.show();
		this._okButton!.focus();
	}

	private resetActions(): void {
		this._actions = [];
		for (let actionButton of this._actionButtons) {
			actionButton.element.style.visibility = 'hidden';
		}
	}

	public override dispose(): void {
	}
}
