import {Property, style, THtmlDivElement, THtmlEMElement, THtmlImgElement, THtmlTextElement} from "tiny";
import {TButton} from "sparrow/components/Button";
import {TLayoutGroup} from "sparrow/components/LayoutGroup";
import {TText} from "sparrow/components/Text";
import {TPopup} from "sparrow/components/Popup";
import {TList, TListItem} from "sparrow/components/List";
import {TCheckbox} from "sparrow/components/Checkbox";
import {TTextInput} from "sparrow/components/TextInput";
import {Domain} from "../Types.ts";
import {db} from "../Database.ts";
import config from "../../config.json";
import defaultIcon from "/favicon/article-favicon-place-holder.png";
import defaultIcon2X from "/favicon/article-favicon-place-holder-2x.png";
import {TOutsideClickComponent} from "sparrow/components/Common";

export class TFilter extends THtmlDivElement {
    private selectedDomainTitle: TText<unknown> = new TText();
    private filterIcon = new THtmlImgElement();
    selectedItemTitle: string[] = [];
    private layoutDomainGroupButton = new TLayoutGroup();
    private domainMenu: TList<unknown, THtmlDivElement> = new TList(new THtmlDivElement());
    domainCheckState: TCheckbox<THtmlEMElement> = new TCheckbox();
    private filterNumberDiv = new THtmlDivElement();
    private domainSearchInput: TTextInput<unknown> = new TTextInput();
    onFilterDataChange?: () => void;

    @Property domainNames: Domain[] = [];

    private menuItem(text: string, iconSrc: string, iconSrcSet: string) {
        const listItem: TListItem<TCheckbox<string>, THtmlDivElement> = new TListItem(new THtmlDivElement());
        const checkboxItem: TCheckbox<string> = new TCheckbox();
        listItem.data = checkboxItem;
        const itemIcon = new THtmlImgElement();
        itemIcon.src = iconSrc;
        itemIcon.srcSet = iconSrcSet;
        itemIcon.width = 16;
        itemIcon.height = 16;
        const textEl = new TText(text);
        textEl.truncate = 1;
        checkboxItem.slotPush(checkboxItem.endGroupSlot, itemIcon, textEl);
        listItem.slotPush(listItem.contentGroupSlot, checkboxItem);
        checkboxItem.className = "check-item no-hover font-weight-600";
        checkboxItem.input.className = "checkbox";
        checkboxItem.onChange = () => {
            if (checkboxItem.isChecked) {
                this.selectedItemTitle.push(text);
            } else {
                this.selectedItemTitle.splice(this.selectedItemTitle.indexOf(text), 1);
            }
            this.setFilterState();
            if (this.onFilterDataChange)
                this.onFilterDataChange();
            this.saveFilters();
        }
        checkboxItem.data = text;
        return listItem;
    }

    private setFilterState() {
        if (this.selectedItemTitle.length > 0 && this.selectedItemTitle.length < this.domainNames.length) {
            this.domainCheckState.isChecked = false;
            this.domainCheckState.isIndeterminate = true;
            this.filterIcon.src = "/assets/icons/filter-fill-icon.svg";
        } else if (this.selectedItemTitle.length == 0) {
            this.domainCheckState.isChecked = false;
            this.domainCheckState.isIndeterminate = false;
            this.filterIcon.src = "/assets/icons/filter-icon-rounded.png";
        } else {
            this.domainCheckState.isChecked = this.selectedItemTitle.length === this.domainNames.length;
            this.domainCheckState.isIndeterminate = false;
            this.filterIcon.src = "/assets/icons/filter-icon-rounded.png";
        }
    }

    private saveFilters() {
        const isCheckedData: { [index: string]: boolean } = {};
        for (let i = 0; i < this.domainNames.length; i++) {
            const data = this.domainMenu.children<TListItem<unknown, THtmlDivElement>>(i)!.data;
            if (data && data instanceof TCheckbox) {
                isCheckedData[this.domainNames[i].name] = data.isChecked!;
            }
        }
        db.saveFilterChecked(isCheckedData);
    }

    private setFilterChecked() {
        const filters = db.loadFilterChecked();
        for (let i = 0; i < this.domainNames.length; i++) {
            const data = this.domainMenu.children<TListItem<unknown, THtmlDivElement>>(i)!.data;
            if (data && data instanceof TCheckbox) {
                data.isChecked = filters[this.domainNames[i].name] ?? true;
                const index = this.selectedItemTitle.indexOf(data.data);
                if (data.isChecked) {
                    if (index == -1)
                        this.selectedItemTitle.push(data.data);
                } else {
                    if (index != -1)
                        this.selectedItemTitle.splice(index, 1);
                }
            }
        }
    }

    private setSelectedFilterText() {
        if (this.selectedItemTitle.length > 0 && this.selectedItemTitle.length < this.domainMenu.childrenCount) {
            this.layoutDomainGroupButton.className = "filter-item has-filter";
            this.selectedDomainTitle.text = this.selectedItemTitle[0];
            if (this.selectedItemTitle.length > 1) {
                this.selectedDomainTitle.text = this.selectedItemTitle[0];
                this.filterNumberDiv.style = style({display: "block"})
                this.filterNumberDiv.splice(0, this.filterNumberDiv.childrenCount, new TText(` ${this.domainNames.length} / ${this.selectedItemTitle.length}`));
            } else
                this.filterNumberDiv.style = style({display: "none"})
        } else {
            this.layoutDomainGroupButton.className = "filter-item";
            this.selectedDomainTitle.text = "";
            this.filterNumberDiv.style = style({display: "none"})
        }
    }

    private arrowDropdownIcon() {
        const arrowDropdownIcon = new THtmlImgElement();
        arrowDropdownIcon.src = "/assets/icons/arrow-drop-down.png";
        return arrowDropdownIcon
    }

    private handleSearchInputChange() {
        if (this.domainSearchInput.value) {
            for (let i = 0; i < this.domainNames.length; i++) {
                if (this.domainNames[i].name.toLowerCase().includes(this.domainSearchInput.value.toLowerCase()))
                    this.domainMenu.children<TListItem<unknown, any>>(i)!.style = {display: "unset"};
                else
                    this.domainMenu.children<TListItem<unknown, any>>(i)!.style = {display: "none"};

            }
        } else {
            for (let i = 0; i < this.domainMenu.childrenCount; i++) {
                this.domainMenu.children<TListItem<unknown, any>>(i)!.style = {display: "unset"};
            }
        }
    }

    private checkAll() {
        if (!this.domainCheckState.isIndeterminate) {
            if (this.domainCheckState.isChecked) {
                this.selectedItemTitle = this.domainNames.map((item) => item.name);
            } else {
                this.selectedItemTitle = [];
            }
            for (let i = 0; i < this.domainMenu.childrenCount; i++) {
                this.domainMenu.children<TListItem<TCheckbox<unknown>, any>>(i)!.data!.isChecked = this.domainCheckState.isChecked;
            }
        }
    }

    private onDomainNamesChange() {
        if (this.domainMenu.childrenCount > 0)
            this.domainMenu.splice(0, this.domainMenu.childrenCount);
        let srcIcon: string | undefined
        let srcSetIcon: string
        this.domainNames.reduce((previousValue: TList<unknown, THtmlDivElement>, item) => {
            if (item.icon_16) {
                srcIcon = config.serverBaseDomain + config.icons_path + item.icon_16;
                if (item.icon_32)
                    srcSetIcon = `${srcIcon} 1x, ${config.serverBaseDomain + config.icons_path + item.icon_32} 2x`;
                else
                    srcSetIcon = ""
            } else if (!item.icon_16 && item.icon_32 != null) {
                srcIcon = config.serverBaseDomain + config.icons_path + item.icon_32;
                srcSetIcon = ""
            } else if (!item.icon_16 && !item.icon_32) {
                srcIcon = defaultIcon
                srcSetIcon = `${srcIcon} 1x, ${defaultIcon2X} 2x`;
            }
            const menu = this.menuItem(item.name, srcIcon!, srcSetIcon);
            menu.data!.isChecked = item.checked;
            if (item.checked)
                this.selectedItemTitle.push(item.name);
            previousValue.push(menu);
            return previousValue;
        }, this.domainMenu);
        this.domainMenu.className = "overflow-auto";
        this.setFilterChecked();
        this.setFilterState();
        if (this.onFilterDataChange)
            this.onFilterDataChange();
    }

    constructor() {
        super();
        const layoutGroup = new THtmlDivElement();
        layoutGroup.className = "filter";

        const filterBtn = new TButton();
        this.filterIcon.src = "/assets/icons/filter-icon-rounded.png";
        filterBtn.slotPush(filterBtn.contentGroupSlot, this.filterIcon);
        filterBtn.className = "filter-btn";

//------------------------------domain filter component
        //Search Input:
        const searchIcon = new THtmlImgElement();
        searchIcon.className = "search-icon";
        searchIcon.src = "/assets/icons/search.svg";
        this.domainSearchInput.className = "filter-search-input";
        this.domainSearchInput.slotPush(this.domainSearchInput.startGroupSlot, searchIcon);

        this.domainSearchInput.onInput = () => {
            this.handleSearchInputChange();
        }

        this.domainSearchInput.onClear = () => {
            this.handleSearchInputChange();
        }


        const domainStateItem = new TListItem(new THtmlDivElement());
        domainStateItem.className = "state-item caption1 font-weight-600";

        this.domainCheckState.className = "check-item no-hover";
        this.domainCheckState.input.className = "checkbox";
        this.domainCheckState.slotPush(this.domainCheckState.endGroupSlot, new TText("Sources"));
        domainStateItem.slotPush(domainStateItem.contentGroupSlot, this.domainCheckState);
        this.domainCheckState.onChange = () => {
            this.checkAll();
            if (this.onFilterDataChange)
                this.onFilterDataChange();
            this.saveFilters();
        }

        const popup = new THtmlDivElement();
        popup.className = "popup-menu";
        const menuHeader = new THtmlDivElement();
        menuHeader.push(this.domainSearchInput, domainStateItem);
        menuHeader.className = "menu-header";
        popup.push(menuHeader);

        popup.push(this.domainMenu);

        const domainPopupMenu = new TPopup();
        domainPopupMenu.position = {top: 25, left: 0};

        const domainButton: TButton<unknown> = new TButton();
        domainButton.className = "domain-button";
        this.filterNumberDiv.className = "plus";
        domainButton.slotPush(domainButton.startGroupSlot, new THtmlTextElement('Sources'), this.arrowDropdownIcon());
        domainButton.slotPush(domainButton.contentGroupSlot, this.filterNumberDiv);

        domainPopupMenu.slotPush(domainPopupMenu.anchorElementSlot, domainButton);
        domainPopupMenu.slotPush(domainPopupMenu.popoverContentSlot, popup);

        const cancelButton: TButton<unknown> = new TButton();
        const cancelIcon = new THtmlImgElement();
        cancelIcon.src = "/assets/icons/cancel.svg";
        cancelButton.className = "cancel-button";
        cancelButton.push(cancelIcon);
        cancelButton.onClick = () => {
            this.domainCheckState.isIndeterminate = false;
            this.domainCheckState.isChecked = true;
            this.checkAll();
            this.saveFilters();
            if (this.onFilterDataChange)
                this.onFilterDataChange();
        }

        this.layoutDomainGroupButton.push(domainPopupMenu, domainButton, cancelButton);

        domainButton.onClick = (event: MouseEvent): void => {
            event.stopPropagation();
            if (domainPopupMenu.isVisible)
                domainPopupMenu.close()
            else
                domainPopupMenu.show();
        }

        const popupMenuOutsideClick: TOutsideClickComponent = new TOutsideClickComponent(domainPopupMenu);
        popupMenuOutsideClick.onOutsideClick = (): void => {
            if (domainPopupMenu.isVisible) {
                domainPopupMenu.close();
                if (!this.domainCheckState.isIndeterminate)
                    if (!this.domainCheckState.isChecked) {
                        this.domainCheckState.isChecked = true;
                        this.checkAll();
                        this.saveFilters();
                        if (this.onFilterDataChange)
                            this.onFilterDataChange();
                    }
            }
        }
        domainPopupMenu.push(popupMenuOutsideClick);

        domainPopupMenu.onClose = (): void => {
            this.setSelectedFilterText();
            this.domainSearchInput.value = "";
            this.handleSearchInputChange();
        }

//------------------------------------other filter items
        //todo:
        // 1. add each filter item component in a layotGrupe (like layoutDomainGroupButton)
        // 2. make TFilterItem component

        // const sourcesButton: TButton<unknown> = new TButton();
        // sourcesButton.push(new TText('Sources'), this.arrowDropdownIcon());
        //
        // const importanceButton: TButton<unknown> = new TButton();
        // importanceButton.push(new TText('Importance'), this.arrowDropdownIcon());

        const filterGroupContainer = new THtmlDivElement();

        filterGroupContainer.push(
            this.layoutDomainGroupButton,
            // sourcesButton, importanceButton
        );
        filterGroupContainer.className = "hide filter-group-container";
        this.layoutDomainGroupButton.className = "filter-item";

        //??
        let isShow = false;
        filterBtn.onClick = () => {
            filterBtn.className = "filter-btn";
            filterGroupContainer.className = "hide filter-group-container";
            isShow = !isShow;
            if (isShow) {
                filterBtn.className = "filter-btn btn-is-active";
                filterGroupContainer.className = "filter-group-container";
            }
        }

        // this.className = "filter";
        this.push(
            layoutGroup.push(
                filterGroupContainer,
                filterBtn,
                domainPopupMenu,
            ),
        )
        // Default :
        this.domainCheckState.isChecked = true;
    }
}