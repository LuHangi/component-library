<template>
	<view class="next-tree">
		<view class="next-tree-mask" :class="{'show':showTree}" @tap="cCancel"></view>
		<view class="next-tree-cnt" :style="'top:'+top" :class="{'show':showTree, 'next-tree-cnt-page': uiMode === 'page'}">
			<view v-if="cShowTreeBar" class="next-tree-bar">
				<view class="next-tree-bar-cancel" :style="{'color':cancelColor}" :hover-class="'hover-c'" @tap="cCancel">取消</view>
				<view class="next-tree-bar-title" :style="{'color':titleColor}">{{customTitle}}</view>
				<view class="next-tree-bar-btns">
					<view v-if="['checkbox', 'radio'].indexOf(funcMode) !== -1" class="next-tree-bar-cancel" :style="{'color':cancelColor}" :hover-class="'hover-c'" @tap="cClear">清空</view>
					<view v-else-if="funcMode === 'edit'" class="next-tree-bar-cancel" :style="{'color':cancelColor}" :hover-class="'hover-c'" @tap="cRevert">还原</view>
					<view class="btn-divid"></view>
					<view class="next-tree-bar-confirm" :style="{'color':cThemeColor}" :hover-class="'hover-c'" @tap="cConfirm">确定</view>
				</view>
			</view>
			<view class="next-tree-view" :style="'top:'+(cShowTreeBar?'72rpx':'0rpx')">
				<input-search-more v-if="ifSearch" @search="onSearch" mode="center" placeholder="请输入关键字" :isFixedSearchBtn="false" />
				<slot name="topBar"></slot>
				<scroll-view class="next-tree-view-sc" :scroll-y="true">
					<view v-if="cTreeList.length">
						<block v-for="(item, index) in cTreeList" :key="index">
							<view class="next-tree-item-block" v-if="item.show">
								<view class="next-tree-item" 
									:style="[{
										paddingLeft: item.rank*15 + 'px',
										zIndex: item.rank*-1 +50
									}]" 
									:class="{
										border: border === true,
										show: item.show,
										last: item.lastRank,
										showchild: item.showChild,
										open: item.open,
										disabled: item.disabled === true
									}">
									<block v-if="showAuxiliaryLine">
										<template v-if="item.rank > 1">
											<view :key="i" v-for="i in (item.rank - 1)" :style="{left: (6 * (2*i - 1) + 3 * (i - 1)) + 'px'}"
												class="parent-horizontal-line"></view>
										</template>
										<view class="left-line">
											<view v-if="item.lastRank" class="horizontal-line"></view>
										</view>
									</block>
									<view class="next-tree-label" @tap.stop="cTreeItemTap(item, index)">
										<image class="next-tree-icon" :src="item.lastRank ? lastIcon : item.showChild ? currentIcon : defaultIcon"></image>
										<input 
											v-model="item.name" 
											@tap.stop 
											class="label-input" 
											placeholder="请输入" 
											v-if="funcMode === 'edit' && item.status === 'edit'" 
										/>
										<rich-text :nodes="getNodes(item.ouputText)" :selectable="false" v-else-if="ifSearch && searchModel==='depHighlight' && keywords"></rich-text>
										<slot v-else-if="$slots.label" name="label" :data="cGetLabelSlotData(item)"></slot>
										<rich-text v-else-if="item.checked && !item.disabled" :nodes="getThemeNodes(item.name)"></rich-text>
										<text v-else>{{item.name}}</text>
									</view>
									<template v-if="['checkbox', 'radio'].indexOf(funcMode) !== -1">
										<view class="next-tree-check" @tap.stop="cTreeItemSelect(item, index)"
											v-if="selectParent === true ? true : item.lastRank">
											<view class="next-tree-check-yes" v-if="item.checked" :class="{'radio':!multiple}"
												:style="{'border-color': item.disabled ? '#ccc' : cThemeColor, 'background-color': item.disabled ? '#ccc' : cThemeColor}">
												<view class="next-tree-check-yes-b"
													:style="{'background-color':item.disabled ? '#ccc' : cThemeColor}">
													<text v-if="item.checked" class="icon-text">✔</text>
												</view>
											</view>
											<view class="next-tree-check-no" v-else :class="{'radio':!multiple}"
												:style="{'border-color': item.disabled ? '#ccc' : cThemeColor}">
												<text v-if="showHalfChecked(item) && showHalfCheckedTips"
													:style="{'color': item.disabled ? '#ccc' : cThemeColor, 'font-weight': 'blod', 'font-size': '10px'}"
													class="icon-text">一</text>
											</view>
										</view>
									</template>
									<template v-else-if="funcMode === 'edit'">
										<text v-if="item.status === 'loading'" :style="{'color': '#ccc'}"
											class="iconfont-loading icon-btn">&#xe629;</text>
										<view v-else>
											<text @click="_complete(item)" v-if="item.status === 'edit'"
												:style="{'color': item.disabled ? '#ccc' : cThemeColor}"
												class="iconfont icon-btn">&#xe6cf;</text>
											<template v-else>
												<text @click="cEditItem(item)" :style="{'color': item.disabled ? '#ccc' : cThemeColor}"
													class="iconfont icon-btn">&#xe66e;</text>
												<text @click="cAddSubItem(item)" :style="{'color': item.disabled ? '#ccc' : '#333'}"
													class="iconfont icon-btn">&#xe664;</text>
												<text @click="cAddSameItem(item)" :style="{'color': item.disabled ? '#ccc' : '#333'}"
													class="iconfont icon-btn">&#xe601;</text>
											</template>
											<text @click="_delItem(item)" :style="{'color': item.disabled ? '#ccc' : '#ff4d4f'}"
												class="iconfont icon-btn">&#xe602;</text>
										</view>
									</template>
								</view>
							</view>
						</block>
					</view>
					<view v-else>
						<slot v-if="$slots.empty" name="empty"></slot>
						<view class="empty" v-else><text>暂无数据</text></view>
					</view>
					<view v-if="ifSearch" style="height: 80rpx"></view>
					<slot name="bottomBar"></slot>
				</scroll-view>
			</view>
		</view>
		<view class="fixed-bottom-bar">
			<slot name="fixedBottomBar"></slot>
		</view>
	</view>
</template>
	
<script>
	import InputSearchMore from "./components/input-search-more.vue";
	
	export default {
		name: "next-tree",
		components: {
			InputSearchMore
		},
		props: {
			uiMode: {
				type: String,
				default: 'popup' // popup(弹窗), page(页面)
			},
			funcMode: {
				type: String,
				default: 'radio' // display(展示模式), edit(编辑模式), checkbox(多选模式), radio(单选模式)
			},
			treeData: {
				type: Array,
				default: function() {
					return []
				}
			},
			valueKey: {
				type: String,
				default: 'id'
			},
			labelKey: {
				type: String,
				default: 'label'
			},
			disabledKey: {
				type: String,
				default: 'disabled'
			},
			childrenKey: {
				type: String,
				default: 'children'
			},
			title: {
				type: [String, Function],
				default: ''
			},
			selectParent: { //是否可以选父级
				type: Boolean,
				default: false
			},
			foldAll: { //折叠时关闭所有已经打开的子集，再次打开时需要一级一级打开
				type: Boolean,
				default: false
			},
			themeColor: { // 主题颜色
				type: String,
				default: '#f9ae3d' // #f9ae3d
			},
			cancelColor: { // 取消按钮颜色
				type: String,
				default: '' // #757575
			},
			titleColor: { // 标题颜色
				type: String,
				default: '' // #757575
			},
			currentIcon: { // 展开时候的ic
				type: String,
				default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MEQ0QTM0MzQ1Q0RBMTFFOUE0MjY4NzI1Njc1RjI1ODIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MEQ0QTM0MzU1Q0RBMTFFOUE0MjY4NzI1Njc1RjI1ODIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowRDRBMzQzMjVDREExMUU5QTQyNjg3MjU2NzVGMjU4MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowRDRBMzQzMzVDREExMUU5QTQyNjg3MjU2NzVGMjU4MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PidwepsAAAK0SURBVHja7JxbTsJAFIYHww7ciStgCeoGvGxAiOsgURegoL5720AXYLiIr0aJviq3Zx3PhIEnKG3ndtr+f3KixrSUj/ZjzjClIqUUiFm2gAAQAREQEUAEREAERAQQAREQAREBREAEREBEEqa67h9RFDWllDv0awWYlqlQHmu1WjMRRMoV1QFttA12y3xRtdNczq8EsE4/f8FumX2q77ROvNXk8UGMEKdUz6tYJHljaZAbuyUH+UR1to5BEohTuqwPCeS4pAA/qY6o/kyHOAMCeRK3owJnj+rH1jjxhqpVsstaebCz6TmnHWyXyY+xHjSBWBY/bvSgadtXBj9u9KCN3rnIfkzkQVsTEEX0Y2IP2oKo/HhMICcFAThUcwVZNGU6FdbX/XURzkbVF4+ybGhjPrFdgP66QdXNurGtSdk6Xdb9nAJ8oDo3OQlsQZzkdPw41ONBo6vI5scDefRjZg+6gpg3Pxp50CXEvPjR2IOuIXL3oxUPuobI3Y9WPOgDIlc/WvOgL4iL/vqFCcD7LH0xB4hj7cfQ/fWH9qCT+FhG0tN+DBk1PzjOM0SVllixcsBT1AvYc/kAPhc0hRg/3uvxoCgKRN9+dOrBUBB9+9GpB0NC9OVH5x4MDdG1H714kANEV3705kEOEBf9dcPi/lQnsuvLg1wgSu3Ha0v7Uh4MMgUXeuG71H407a+VBy9CPQkOdw+MtB+nGbd/D+FBbhBNxo9SjwcngJjNj0E9yBFiFj8G9SBXiGn8GNyDnCEm8SMLD3KHGOdHNh7kDjHOj2w8mAeIi/5arX+c6b/fxHz9oADEdGdjR/fXCw/OOB5oVfCOgnepz8IB14PMw03jCmTE+QBx5z0gAmKSqK9OUF+hcAeIhu/QYr4Qie8rjW83hhMBERARQAREQAREBBABERCLnH8BBgA+TQI7U4t53AAAAABJRU5ErkJggg=='
			},
			defaultIcon: { // 折叠时候的ic
				type: String,
				default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAACE0lEQVR4Xu3c200DMRCF4XEltJAOkEugA+ggpUAHoQMqiFMCdEAJUMEiS4mEELlIO7bPOeN9i6K1rG/952myyea1WiCtXmEuYBPR4RBMxInoIOCwhOtJLKVszWyXc/5y2BvNEq6I+/3+kFK6M7OHnPM7jcLKjbZAvD/uaZtzflm5P4rbWyJWgDcze1LPuzVihfxUz7sH4ilJ2bx7Isrm3RtRMu8RiHJ5j0SUyXs0okTeCIj0eSMh0uaNhkiZNyIiXd7IiDR5oyNS5M2ACJ83EyJs3myIkHkzIsLlzYwIkzc7IkTeCojD81ZCHJa3GuKQvBURu+etjNgtb3XELnlHQGyedyTEZnlHQ2ySd0RE97wjI7rlHR3RJe+JeIrbLOecD6ePpZQ6W1kn2epo4MUrPOKyLN8ppYq1+y1VStncOjIdGnFZlo+U0uOtWOeOY2TE12Ouq//pEA7xXL7XfvcufR8K0Svfv6CREN3yDYfYIt9QiK3yjYTYLF95xB75SiP2ylcZsVu+cogj8pVCHJWvEuKwfOkREfKlRkTJlxkRJl86RMR8qRBR82VChM0XHpEhX2hElnyREWnyhUNkzBcKkTVfJETafIcjKuQ7FFEl35GIMvl2R1TMtyuiar49EWXzbY5oZpv/hibXTF2h3+s60FRKeT6+3TjMS3nrA3ZFRD8xrfY3ER1kJ+JEdBBwWGKeRAfEH1wS5WFZSDB/AAAAAElFTkSuQmCC'
			},
			lastIcon: { // 没有子集的ic
				type: String,
				default: ''
			},
			border: { // 是否有分割线
				type: Boolean,
				default: false
			},
			checkStrictly: { // 只有在funcMode为checkbox状态下生效； 状态下节点选择完全受控（父子节点选中状态不再关联）
				type: Boolean,
				default: false
			},
			checkStrictlyModel: { // 关联模式 weak: 弱关联；strong: 强关联
				type: String,
				default: 'weak'
			},
			showHalfCheckedTips: { // 只有在funcMode为checkbox, checkStrictly为false状态下生效； 父子节点选中状态不再关联，显示半选提示
				type: Boolean,
				default: true
			},
			ifSearch: { // 是否开启search模式
				type: Boolean,
				default: true
			},
			searchModel: { // 搜索模式配置
				type: String,
				default: 'common' // depHighlight: 从属高亮；common: 一般；remote：远程
			},
			showAuxiliaryLine: { // 辅助线模式
				type: Boolean,
				default: false
			},
			loadData: {
				type: Function
			},
			height: {
				type: Number,
				default: 500
			},
			changeVerify: {
				type: Function
			},
			expandedKeys: { // (Controlled) Specifies the keys of the expanded treeNodes
				type: Array,
				default: () => ([])
			},
			expandedMode: { // common:  一般模式；singe: 单一模式；
				type: String,
				default: 'common'
			}
		},
		data() {
			return {
				showTree: false,
				treeList: [],
				currentTreeData: [],
				selectIndex: -1,
				keywords: '',
				nodeInitContrl: {},
				top: '',
				initNum: 1
			}
		},
		options: {
			styleIsolation: 'shared'
		},
		computed: {
			cShowTreeBar() {
				return this.uiMode === 'popup'
			},
			cThemeColor() {
				return this.themeColor || '#f9ae3d'
			},
			cTreeList() {
				if (this.ifSearch && this.keywords) {
					return this.treeList.filter(item => {
						return (item.name && item.name.indexOf(this.keywords) !== -1)
					}).map(item => {
						const o = JSON.parse(JSON.stringify(item));
						if (o.showChild === false) {
							o.showChild = true;
						}
						if (o.show === false) {
							o.show = true;
						}
						return o
					})
				} else {
					return this.treeList
				}
			},
			customTitle() {
				if (typeof this.title === 'function') {
					return this.title(this.cGetCheckedParams());
				} else {
					return this.title
				}
			},
			multiple() {
				if (this.funcMode === 'checkbox') {
					return true
				} else if (this.funcMode === 'radio') {
					return false
				} else {
					return true
				}
			}
		},
		methods: {
			cShow() {
				this.showTree = true
			},
			cHide() {
				this.showTree = false
			},
			cCancel() {
				this.cHide()
				this.$emit("cancel", '');
			},
			cConfirm() {
				// 处理所选数据
				let rt = this.cGetCheckedParams();
				this.cHide()

				this.$emit("confirm", rt);
			},
			cGetLabelSlotData(item) {
				const _it = this.getItemFromTreeData(this.currentTreeData, item.id);
				const it = Object.assign({}, _it);
				delete it[this.childrenKey];
				return it;
			},
			cGetCheckedParams() {
				// 处理所选数据
				let rt = [],
					obj = {};
				this.treeList.forEach((v, i) => {
					if (this.treeList[i].checked) {
						obj = {}
						obj.parents = this.treeList[i].parents
						obj = Object.assign(obj, this.treeList[i].source)
						// 移除子元素
						delete obj.children
						rt.push(obj)
					}
				});
				return rt;
			},
			cAddSubItem(item) {
				if (item.disabled) return;
				const it = Object.assign({}, item);
				if (item.lastRank) {
					item.lastRank = false;
					item.showChild = true;
				}
				this.$nextTick(() => {
					this.initNum++;
					const parentId = item.parentId.concat([]);
					const parents = item.parents.concat([]);
					parentId.push(item.id);
					parents.push(item);
					it.disabled = false;
					it.rank = it.rank + 1;
					it.id = `next-tree-${this.initNum}`;
					it.parentId = [...parentId];
					it.parents = [...parents];
					it.show = true;
					it.showChild = false;
					it.open = false;
					it.name = '';
					it.status = 'edit';
					it.source = {};
					it.hideArr = [];
					it.lastRank = true;
					let index = -1;
					for (let i = this.treeList.length - 1; i >= 0; i--) {
						if (this.treeList[i].id === item.id) {
							index = i;
							break;
						}
					}
					if (index !== -1) {
						this.treeList.splice(index + 1, 0, it);
					}
				})
			},
			cAddSameItem(item) {
				if (item.disabled) return;
				const it = Object.assign({}, item);
				let index = -1;
				for (let i = this.treeList.length - 1; i >= 0; i--) {
					if (this.treeList[i].id === item.id || this.treeList[i].parentId.indexOf(item.id) !== -1) {
						index = i;
						break;
					}
				}
				this.initNum++;
				it.id = `next-tree-${this.initNum}`;
				it.source = {};
				it.hideArr = [];
				it.name = "";
				it.status = 'edit';
				if (index !== -1) {
					this.treeList.splice(index + 1, 0, it);
				}
			},
			async _complete(item) {
				if (item.name) {
					item.status = 'loading';
					if (item.operateCallback) {
						await item.operateCallback('complete', item);
						await this.$nextTick();
					}
					item.status = '';
				} else {
					uni.showToast({
						title: '请先完善内容',
						icon: 'none'
					})
				}
			},
			cEditItem(item) {
				if (item.disabled) return;
				item.status = 'edit';
			},
			cRevert() {
				this.uiModeInit();
			},
			async _delItem(item) {
				if (item.disabled) return;
				item.status = 'loading';
				if (item.operateCallback) {
					await item.operateCallback('delete', item);
					await this.$nextTick();
				}
				this.delItemFunc(item);
			},
			delItemFunc(item) {
				const id = item && item.id ? item.id : '';
				const ids = [];
				this.treeList.map((it, index) => {
					if (it.id === id) {
						ids.push(index);
					} else if (it.parentId.indexOf(id) !== -1) {
						ids.push(index);
					}
				});
				ids.sort((a, b) => b - a);
				ids.forEach(index => {
					this.treeList.splice(index, 1);
				});
			},
			checkedFunc(values, state = true) {
				if (values instanceof Array) {
					values.map(id => {
						const item = this.treeList.find(it => it.id === id);
						if (item) {
							item.checked = !!state
						}
					})
				} else {
					const _item = this.treeList.find(it => it.id === values);
					if (_item) {
						_item.checked = !!state
					}
				}
			},
			getRenderTreeList(list = [], rank = 0, parentId = [], parents = []) {
				const treeList = [];
				list.forEach(item => {
					const halfChecked = this.getHalfCheckedFormTreeData(item);
					let ouputText = '';
					if (this.searchModel === 'depHighlight') {
						if (parents && parents.length) {
							ouputText = parents.map(item => item[this.labelKey]).join(' &gt; ');
							ouputText = ouputText + ' &gt; ' + item[this.labelKey];
						} else {
							ouputText = item[this.labelKey];
						}
					}
					const bool1 = this.expandedKeys.indexOf(item[this.valueKey]) !== -1;
					const len = parentId.length;
					const bool2 = len > 0 ? this.expandedKeys.indexOf(parentId[len - 1]) !== -1 : bool1;
					treeList.push({
						id: item[this.valueKey],
						name: item[this.labelKey],
						source: item,
						parentId, // 父级id数组
						parents, // 父级id数组
						rank, // 层级
						showChild: bool1, //子级是否显示
						open: bool1, //是否打开
						show: (bool1 || bool2) || rank === 0, // 自身是否显示
						hideArr: [],
						ouputText,
						orChecked: item.checked ? item.checked : false,
						checked: item.checked ? item.checked : false,
						halfChecked,
						disabled: this.disabledKey && item[this.disabledKey] === true,
						status: '',
						operateCallback: (typeof item.operateCallback) === 'function' ? item.operateCallback : undefined
					})
					if (bool1) {
						this.nodeInitContrl[item[this.valueKey]] = true;
					} else {
						this.nodeInitContrl[item[this.valueKey]] = undefined;
					}
					if (
						(Array.isArray(item[this.childrenKey]) && item[this.childrenKey].length > 0) ||
						(this.loadData && Array.isArray(item[this.childrenKey]) && item[this.childrenKey].length === 0)
					) {
						let parentid = [...parentId],
							parentArr = [...parents],
							childrenid = [];
						delete parentArr.children
						parentid.push(item[this.valueKey]);
						parentArr.push({
							[this.valueKey]: item[this.valueKey],
							[this.labelKey]: item[this.labelKey],
						})
					} else if (item[this.childrenKey] === null) {
						treeList[treeList.length - 1].lastRank = true;
					} else {
						treeList[treeList.length - 1].lastRank = true;
					}
				})
				return treeList;
			},
			//扁平化树结构
			cRenderTreeList(list = [], rank = 0, parentId = [], parents = []) {
				list.forEach(item => {
					const halfChecked = this.getHalfCheckedFormTreeData(item);
					let ouputText = '';
					if (this.searchModel === 'depHighlight') {
						if (parents && parents.length) {
							ouputText = parents.map(item => item[this.labelKey]).join(' &gt; ');
							ouputText = ouputText + ' &gt; ' + item[this.labelKey];
						} else {
							ouputText = item[this.labelKey];
						}
					}
					const bool1 = this.expandedKeys.indexOf(item[this.valueKey]) !== -1;
					const len = parentId.length;
					const bool2 = len > 0 ? this.expandedKeys.indexOf(parentId[len - 1]) !== -1 : bool1;
					this.treeList.push({
						id: item[this.valueKey],
						name: item[this.labelKey],
						source: item,
						parentId, // 父级id数组
						parents, // 父级id数组
						rank, // 层级
						showChild: bool1, //子级是否显示
						open: bool1, //是否打开
						show: (bool1 || bool2) || rank === 0, // 自身是否显示
						hideArr: [],
						ouputText,
						orChecked: item.checked ? item.checked : false,
						checked: item.checked ? item.checked : false,
						halfChecked,
						disabled: this.disabledKey && item[this.disabledKey] === true,
						status: '',
						operateCallback: (typeof item.operateCallback) === 'function' ? item.operateCallback : undefined
					})
					if (bool1) {
						this.nodeInitContrl[item[this.valueKey]] = true;
					} else {
						this.nodeInitContrl[item[this.valueKey]] = undefined;
					}
					if (
						(Array.isArray(item[this.childrenKey]) && item[this.childrenKey].length > 0) ||
						(this.loadData && Array.isArray(item[this.childrenKey]) && item[this.childrenKey].length === 0)
					) {
						let parentid = [...parentId],
							parentArr = [...parents],
							childrenid = [];
						delete parentArr.children
						parentid.push(item[this.valueKey]);
						parentArr.push({
							[this.valueKey]: item[this.valueKey],
							[this.labelKey]: item[this.labelKey],
						})
						this.cRenderTreeList(item[this.childrenKey], rank + 1, parentid, parentArr);
					} else if (item[this.childrenKey] === null) {
						this.treeList[this.treeList.length - 1].lastRank = true;
					} else {
						this.treeList[this.treeList.length - 1].lastRank = true;
					}
				})
			},
			// 处理默认选择
			cDefaultSelect() {
				this.treeList.forEach((v, i) => {
					if (v.checked) {
						this.treeList.forEach((v2, i2) => {
							if (v.parentId.toString().indexOf(v2.parentId.toString()) >= 0) {
								v2.show = true
								if (v.parentId.includes(v2.id)) {
									v2.showChild = true;
									v2.open = true;
								}
							}
						})
					}
				})
			},
			// 点击
			async cTreeItemTap(item, _index) {
				const index = this.treeList.findIndex(it => it.id === item.id);
				if (item.lastRank === true) {
					if (item.disabled === true) return
					if (['checkbox', 'radio'].indexOf(this.funcMode) === -1) return
					//点击最后一级时触发事件
					this.treeList[index].checked = !this.treeList[index].checked;

					if (this.changeVerify && (typeof this.changeVerify === 'function')) {
						const current = Object.assign({}, item.source);
						current.checked = item.checked;
						const _this = this.$parent || this;
						const tip = this.changeVerify.call(_this, current, this.multiple ? this.cGetCheckedParams() : [current]);
						if (tip) {
							this.treeList[index].checked = !this.treeList[index].checked;
							uni.showToast({
								title: tip,
								icon: 'none'
							});
							return
						}
					};
					this.treeList[index].halfChecked = false;
					if (this.multiple && !this.checkStrictly && this.showHalfCheckedTips) {
						this.updateHalfChecked(index);
					} else if (this.multiple && this.checkStrictly) {
						this.updateParentChecked(index);
					}
					this.cFixMultiple(index);
					this.$emit("change", this.cGetCheckedParams());
					return;
				} else if (this.ifSearch && this.keywords) {
					// 搜索模式下不处理展开收起逻辑
					return
				}
				// loadData实现
				const isLoadData = this.loadData && !this.nodeInitContrl[item.id];
				if (isLoadData) {
					uni && uni.showLoading({
						title: "请稍后..."
					});
					const _this = this.$parent || this;
					const newChild = await this.loadData.call(_this, {
						$type: 'nodeLoad',
						source: this.treeList[index].source
					});
					// 为了保证treeData数据的完整性，异步加载的数据需要添加到treeData上；
					const treeItem = this.getItemFromTreeData(this.currentTreeData, item.id);
					treeItem[this.childrenKey] = newChild && newChild.length ? newChild : undefined;
					const parentId = item.parentId || [];
					const lists = this.getRenderTreeList(newChild || [], item.rank + 1, parentId.concat([item.id]), [{
						[this.valueKey]: item[this.valueKey],
						[this.labelKey]: item[this.labelKey]
					}]);
					this.nodeInitContrl[item.id] = true;
					this.treeList.splice(index + 1, 0, ...lists);
				}
				const childLen = this.treeList.filter(it => it.parentId.includes(item.id)).length;
				if (!isLoadData && childLen > 50) {
					uni && uni.showLoading({
						title: "请稍后..."
					});
				}
				let list = this.treeList;
				let id = item.id;
				item.showChild = !item.showChild;
				item.open = item.showChild ? true : !item.open;
				list.forEach((childItem, i) => {
					if (item.showChild === false) {
						//隐藏所有子级
						if (!childItem.parentId.includes(id)) {
							return;
						} else {
							if (!this.foldAll) {
								if (childItem.lastRank !== true && !childItem.open) {
									childItem.showChild = false;
								}
								// 为隐藏的内容添加一个标记
								if (childItem.show) {
									childItem.hideArr[item.rank] = id
								}
							} else {
								if (childItem.lastRank !== true) {
									childItem.showChild = false;
								}
							}
							childItem.show = false;
						}
					} else {
						// 打开子集
						if (childItem.parentId[childItem.parentId.length - 1] === id) {
							childItem.show = true;
						}

						// 打开被隐藏的子集
						if (childItem.parentId.includes(id) && !this.foldAll) {
							if (childItem.hideArr[item.rank] === id) {
								childItem.show = true;
								if (childItem.open && childItem.showChild) {
									childItem.showChild = true
								} else {
									childItem.showChild = false
								}
								childItem.hideArr[item.rank] = null
							}
						} else if (this.expandedMode === 'singe' && !childItem.parentId.includes(id)) {
							if (childItem.id !== id) {
								const bool1 = item.parentId.some(id => {
									return (childItem.parentId && childItem.parentId.indexOf(id) !== -1) || childItem.rank === 0;
								});
								const childItemParentId = [...childItem.parentId];
								const _id = childItemParentId ? childItemParentId.pop() : '';
								const nodeList = [item, {
									parentId: childItemParentId.length ? childItemParentId : []
								}];
								if (!childItem.lastRank) {
									if (item.parentId.indexOf(childItem.id) === -1) {
										childItem.showChild = false;
									}

									if (!bool1 && !this.isSiblingNode([item, childItem])) {
										childItem.show = false;
									} else if (childItem.rank !== 0 && _id !== id && this.isSiblingNode(nodeList)) {
										childItem.show = false;
									} else if (childItem.rank !== 0 && _id !== id && !this.isSiblingNode(nodeList) && this
										.isParentSiblingNode(nodeList)) {
										childItem.show = false;
									}
								} else {
									if (!this.isSiblingNode([item, childItem]) && !bool1) {
										childItem.show = false;
									} else if (_id !== id && this.isSiblingNode(nodeList)) {
										childItem.show = false;
									} else if (_id !== id && !this.isSiblingNode(nodeList) && this.isParentSiblingNode(nodeList)) {
										childItem.show = false;
									}
								}
							}
						}
					}
				});
				setTimeout(() => {
					uni && uni.hideLoading()
				})
			},
			isSiblingNode(targetArr = []) {
				const target1 = targetArr && targetArr.length ? targetArr[0] : {};
				let target1Id = '';
				if (target1.parentId && target1.parentId.length) {
					target1Id = target1.parentId[target1.parentId.length - 1]
				}
				return targetArr.every(item => {
					if (item && item.parentId && item.parentId.length) {
						return target1Id === item.parentId[item.parentId.length - 1]
					} else {
						return target1Id === ''
					}
				})
			},
			isParentSiblingNode(targetArr = []) {
				const target1 = targetArr && targetArr.length ? targetArr[0] : {};
				let target1Id = '';
				if (target1.parentId && target1.parentId.length) {
					target1Id = target1.parentId[target1.parentId.length - 1]
				}
				return targetArr.every(item => {
					if (item && item.parentId && item.parentId.length) {
						return item.parentId.some(id => id === target1Id) && target1Id !== '';
					} else {
						return target1Id === '';
					}
				})
			},
			getThemeNodes(text) {
				const _text = (text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				const regex = new RegExp(`(${text || ''})`, 'gi');
				return text ? text.replace(regex, `<span style="color: ${this.cThemeColor}">$1</span>`) : '';
			},
			getNodes(ouputText) {
				if (this.keywords && ouputText) {
					const key = (this.keywords || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const regex = new RegExp(`(${key})`, 'gi');
					return ouputText.replace(regex, `<span style="color: ${this.cThemeColor}">$1</span>`);
				}
				return ouputText
			},
			getHalfCheckedFormTreeData(item) {
				if (this.checkStrictly) {
					return false;
				} else if (!this.showHalfCheckedTips) {
					return false
				} else {
					if (item[this.childrenKey] && item[this.childrenKey].length) {
						return item[this.childrenKey].some(it => {
							if (it.checked === true) {
								return true;
							} else if (it[this.childrenKey] && it[this.childrenKey].length) {
								return this.getHalfCheckedFormTreeData(it);
							} else {
								return false;
							};
						});
					} else {
						return false;
					}
				}
			},
			getItemFromTreeData(treeData, id) {
				if (id) {
					let item = null;
					(treeData || []).some(it => {
						if (it[this.valueKey] === id) {
							item = it
							return true
						} else if (it[this.childrenKey] && it[this.childrenKey].length) {
							item = this.getItemFromTreeData(it[this.childrenKey], id)
							return !!item
						} else {
							return false
						}
					});
					return item
				};
				return null
			},
			cTreeItemSelect(item, _index) {
				const index = this.treeList.findIndex(it => it.id === item.id);
				if (item.disabled === true) return
				this.treeList[index].checked = !this.treeList[index].checked;

				if (this.changeVerify && (typeof this.changeVerify === 'function')) {
					const current = Object.assign({}, item.source);
					current.checked = item.checked;
					const _this = this.$parent || this;
					const tip = this.changeVerify.call(_this, current, this.multiple ? this.cGetCheckedParams() : [current]);
					if (tip) {
						this.treeList[index].checked = !this.treeList[index].checked;
						uni.showToast({
							title: tip,
							icon: 'none'
						});
						return
					}
				};
				this.treeList[index].halfChecked = false;
				if (this.multiple && this.checkStrictly) {
					if (!item.lastRank) {
						const source = item.source || {};
						const children = source[this.childrenKey] || [];
						const checkedKeyList = this.getChildrenKeys(children);
						this.treeList.forEach((v, i) => {
							if (checkedKeyList.indexOf(v.id) !== -1) {
								if (this.checkStrictlyModel === 'weak') {
									if (!this.treeList[i].disabled) {
										this.treeList[i].checked = this.treeList[index].checked
									}
								} else if (this.checkStrictlyModel === 'strong') {
									this.treeList[i].checked = this.treeList[index].checked
								}
							}
						})
					}
					this.updateParentChecked(index)
				} else if (this.multiple && !this.checkStrictly && this.showHalfCheckedTips) {
					this.updateHalfChecked(index);
				} else {
					this.cFixMultiple(index);
				}

				this.$emit("change", this.cGetCheckedParams());
			},
			updateParentChecked(index) {
				const parentId = (this.treeList[index].parentId || []).concat([]).reverse();
				if (parentId && parentId.length) {
					parentId.map(id => {
						const parentTreeDataItem = this.getItemFromTreeData(this.currentTreeData, id);
						const childrenIds = (parentTreeDataItem[this.childrenKey] || []).map(item => item[this.valueKey]);
						const bool = this.treeList
							.filter(it => childrenIds.indexOf(it.id) !== -1)
							.every(it => it.checked === true);

						const _bool = this.treeList
							.filter(it => childrenIds.indexOf(it.id) !== -1)
							.every(it => it.checked === false);

						const parentItem = this.treeList.find(it => it.id === id);
						if (parentItem) {
							if (this.checkStrictlyModel === 'weak') {
								if (bool && !parentItem.disabled) {
									parentItem.checked = true;
								} else if (_bool && !parentItem.disabled) {
									parentItem.checked = false;
								}
							} else if (this.checkStrictlyModel === 'strong') {
								if (bool) {
									parentItem.checked = true;
								} else {
									parentItem.checked = false;
								}
							}
						}
					})
				}
			},
			updateHalfChecked(index) {
				const _parentId = this.treeList[index].parentId || [];
				const parentId = _parentId.concat([]).reverse();
				if (parentId && parentId.length) {
					parentId.map(id => {
						const parentTreeDataItem = this.getItemFromTreeData(this.currentTreeData, id);
						const childrenIds = (parentTreeDataItem[this.childrenKey] || []).map(item => item[this.valueKey]);

						const bool = this.treeList
							.filter(it => childrenIds.indexOf(it.id) !== -1)
							.every(it => it.checked === false && it.halfChecked === false);

						const _bool = this.treeList
							.filter(it => childrenIds.indexOf(it.id) !== -1)
							.some(it => it.checked === true || it.halfChecked === true);

						const parentItem = this.treeList.find(it => it.id === id);
						if (parentItem) {
							if (!parentItem.checked) {
								if (bool) {
									parentItem.halfChecked = false
								} else if (_bool) {
									parentItem.halfChecked = true
								} else {
									parentItem.halfChecked = false
								}
							}
						}
					})
				}
				if (this.treeList[index].checked == false) {
					const source = this.treeList[index].source || {};
					const children = source[this.childrenKey] || [];
					const checkedKeyList = this.getChildrenKeys(children);
					const bool = this.treeList.filter(item => checkedKeyList.indexOf(item.id) !== -1).some(item => item.checked);
					if (bool) {
						this.treeList[index].halfChecked = true;
					}
				}
			},
			showHalfChecked(item) {
				if (this.multiple && !this.checkStrictly && item.halfChecked === true) {
					return true
				} else {
					return false
				}
			},
			getChildrenKeys(children) {
				let keys = [];
				(children || []).map(item => {
					keys.push(item[this.valueKey])
					if (item[this.childrenKey] && item[this.childrenKey].length) {
						keys = keys.concat(this.getChildrenKeys(item[this.childrenKey]))
					}
				})
				return keys
			},
			// 处理单选多选
			cFixMultiple(index) {
				if (!this.multiple) {
					// 如果是单选
					this.treeList.forEach((v, i) => {
						if (i != index) {
							this.treeList[i].checked = false
						} else {
							this.treeList[i].checked = true
						}
					})
				}
			},
			// 重置数据
			cReTreeList() {
				this.treeList.forEach((v, i) => {
					this.treeList[i].checked = v.orChecked
				})
			},
			cInitTree() {
				this.treeList.length = 0;
				if (this.loadData) {
					this.currentTreeData = JSON.parse(JSON.stringify(this.treeData));
				} else {
					this.currentTreeData = this.treeData;
				}
				this.cRenderTreeList(this.currentTreeData);
				this.$nextTick(() => {
					this.cDefaultSelect();
				})
			},
			cClear() {
				this.treeList.map(item => {
					if (this.multiple && this.checkStrictly) {
						if (this.checkStrictlyModel === 'strong') {
							item.checked = false;
						} else if (this.checkStrictlyModel === 'weak') {
							if (!item.disabled) {
								item.checked = false;
							};
						} else {
							item.checked = false;
						}
					} else {
						if (!item.disabled) {
							item.checked = false;
						}
					};

					item.halfChecked = false;
				})
				this.$emit("change", this.cGetCheckedParams());
				this.$emit("clear");
			},
			async onSearch(val) {
				if (this.searchModel === 'remote') {
					if (this.loadData) {
						if (val) {
							const _this = this.$parent || this;
							const newChild = await this.loadData.call(_this, {
								$type: 'remoteSearch',
								source: val
							});
							const lists = this.getRenderTreeList(newChild);
							this.treeList = [...lists];
						} else {
							this.cInitTree();
						}
					} else {
						uni.showToast({
							title: "使用远程搜索模式，需要配置loadData函数；",
							icon: 'none'
						})
					}
				} else {
					this.keywords = val;
				}
			},
			initUiModePopup(watched) {
				uni.getSystemInfo({
					success: (res) => {
						this.top = (res.windowHeight - this.height) + 'px';
					}
				});
				watched && watched();
				watched = this.$watch(() => this.showTree, (bool) => {
					if (bool) {
						this.cInitTree();
					} else {
						this.$nextTick(() => {
							setTimeout(() => {
								this.treeList.length = 0;
								this.nodeInitContrl = {};
							})
						})
					}
				}, {
					immediate: true
				});
			},
			initUiModePage(watched) {
				this.top = '0px';
				watched && watched();
				watched = this.$watch(() => this.treeData, () => {
					this.treeList.length = 0;
					this.nodeInitContrl = {};
					this.$nextTick(() => {
						this.cInitTree();
					});
				}, {
					immediate: true,
					deep: true
				})
				this.$nextTick(() => {
					this.showTree = true;
				});
			},
			uiModeInit() {
				let watched = null;
				if (this.uiMode === 'popup') {
					this.initUiModePopup(watched);
				} else if (this.uiMode === 'page') {
					this.initUiModePage(watched);
				} else {
					this.initUiModePopup(watched);
				}
			}
		},
		mounted() {
			console.log('----------next-tree组件完成挂载demo------------')
			this.uiModeInit();
		}
	}
</script>

<style scoped>
	@import "./style.css";
</style>