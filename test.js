{% load zakupki_tags %}

var consolidationTree = Ext.getCmp('{{ component.consolidation_tree.client_id }}');
var ordersGrid = Ext.getCmp('{{ component.grid_orders.client_id }}');
var addPositions = []; //кеш для хранения добавленных позиций
var window = Ext.getCmp('{{ component.client_id }}');
var mainForm = Ext.getCmp('{{ component.main_form.client_id }}');
var addNewLotButton = Ext.getCmp('{{component.add_cons_order_btn.client_id }}');
var countConsOrder = 0;
var taboo791name = '{{component.taboo_791_name}}';

window.editMode = {{ component.edit_mode|lower }};
if (window.editMode) {
    setInitialData();
    addNewLotButton.disable();
}
else {
    window.on('show', function(cmp) {addConsolidationOrderQuestName(); });
}
/**
 * Добавление консолидированной заявки
 */
var name_win = {{component.new_lot_window|safe}};

function addConsolidationOrderQuestName() {
    if (win.actionContextJson.is_service && countConsOrder > 0) {
        Ext.Msg.show({
            title: 'Внимание',
            msg: 'Заявки данного типа запрещено разделять по лотам',
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
        return;
    }
    name_win.show();
}

function closeNewLotWindow() {
    name_win.hide();
}


/**
 * Проверка на смешение русских и латинских символов в одном слове.
 *
 * Бла БлаBlah BlahБла!БлаBlah-74 BlahБла74 Blah Бла Blah
 */
function fasNapryaglos(name) {
    var word, cyr, lat;
    var warnings = [];
    // Разбивка на слова
    var words = name.split(/[\s!?.,]/);
    // Проход по каждому слову
    for (var i = 0; i < words.length; i++) {
        word = words[i];
        // Если есть цифры в слове - пропускаем
        if (word.search(/\d+/) == -1) {
            lat = word.search(/[a-zA-Z]+/i);
            cyr = word.search(/[а-яёА-Я]+/i);
            // В слове есть и латиница и кириллица
            if (lat + cyr > 0) {
                warnings.push({
                    word: word
                });
            }
        }
    }

    return warnings;
}

function addConsolidationOrder(name){

    var fas = fasNapryaglos(name.getValue());
    if (fas.length) {
        var msg = '';
        for (var k = 0; k < fas.length; k++) {
            msg += String.format(
                "В поле «Название» в слове «{0}» использована кодировка " +
                    "символов другого языка.<br/>", fas[k].word);
        }
        Ext.Msg.show({
            title: 'Внимание!',
            msg: msg,
            buttons: {ok: 'Сохранить', cancel: 'Исправить'},
            icon: Ext.Msg.WARNING,
            fn: function(buttonId) {
                if (buttonId == 'ok') {
                    createConsolidationOrder(name);
                }
            }
        });
    } else {
        createConsolidationOrder(name);
    }
}

function createConsolidationOrder(name) {
    var rootNode = consolidationTree.getRootNode();
    rootNode.appendChild(new Ext.tree.TreeNode({
        consOrder: name.getValue()
        ,allowDrag : false
        ,lotId : 0
        ,source_order_ids: (countConsOrder + 1)
    }));
    countConsOrder++;
    name.reset();
    closeNewLotWindow();
}

//
var reader = new Ext.data.ArrayReader({}, [
    {name: 'order_num'},
    {name: 'order_date'},
    {name: 'product_name'},
    {name: 'direction_name'},
    {name: 'amount'},
    {name: 'price'},
    {name: 'sum'},
    {name: 'product__okpd2__cripple_benefits'},
    {name: 'product__okpd2__preferences'},
    {name: 'order_id'},
    {name: 'order_item_id'},
    {name: 'product_id'},
    {name: 'currency_id'},
    {name: 'uis'},
    {name: 'direction_id'},
    {name: 'product__info__ext_name'},
    {name: 'taboo'},
    {name: 'product__structured_position__parent_product_id'},
    {name: 'product__is_parent'},
]);

var storeData = [];
var localData;
// Добавление значений строго в соответствии с ридером
{% for order in component.orders_data %}

	var productName = ('{{ order.product__name|replace_new_line }}').replace('"','');

    localData = [
        '{{ order.order__number|safe }}',
        '{{ order.order__docdate|safe }}',
        productName,
        {% if order.product__direction__name %} '{{ order.product__direction__name|safe }}' {% else %} '' {% endif %},
        '{{ order.amount|safe }}',
        '{{ order.expected_price|safe }}',
        '{{ order.expected_sum|safe }}',
        '{{ order.product__okpd2__cripple_benefits|safe }}',
        '{{ order.product__okpd2__preferences|safe }}',
        '{{ order.order__id|safe }}',
        '{{ order.id|safe }}',
        '{{ order.product__id|safe }}',
        '{{ order.product__currency__id|safe }}',
        '{{ order.uis|safe }}',
        {% if order.product__direction__id %} '{{ order.product__direction__id|safe }}' {% else %} '' {% endif %},
        '{{ order.product__info__ext_name|replace_new_line }}',
        '{{ order.taboo|safe }}',
        '{{ order.product__structured_position__parent_product_id|safe }}',
        '{{ order.product__is_parent|safe }}',
    ];
    storeData.push(localData);
{% endfor %}

var store = new Ext.data.GroupingStore({
    reader: reader,
    data: storeData,
    sortInfo:{field: 'direction_name', direction: "ASC"},
    groupField:'order_id'
});

ordersGrid.reconfigure(store, ordersGrid.getColumnModel());

/**
 * Драг энд дроп
 */
function onBeforeDrop(dropObj){
    if (dropObj.source.grid && dropObj.target instanceof Ext.tree.TreeNode){
        var node = dropObj.target;  
        
        node.beginUpdate();
        var sourceGrid = dropObj.source.grid;
        var sel = sourceGrid.getSelectionModel().getSelections();
        var directionIds = Ext.chainPluck(sel, 'data.direction_id');
        // При добавлении позиции с направлением, переносятся все позиции
        // направления
        if(directionIds.length){
            var selIds = Ext.chainPluck(sel, 'data.order_item_id');
            var allRecords = sourceGrid.getStore().getRange();
            var recordToAppend = allRecords.filter(function(el){
                return (el.data.direction_id &&
                    directionIds.indexOf(el.data.direction_id) != -1 &&
                    selIds.indexOf(el.data.order_item_id) == -1);
            });
            sel = sel.concat(recordToAppend);
        }
        for (var i=0; i<sel.length; i++) {
{#            tt.setDisabled(false);#}
{#            tt.show();#}
            // Если уже имеется такая же продукция с такой же ценой, тогда суммируем
            var notHave = true;
            if (notHave) {
                node.appendChild(new Ext.tree.TreeNode({
                    consOrder: sel[i].get('product_name')
                    ,amount: thousandCurrencyRendererForPrice(sel[i].get('amount') )
                    ,price: thousandCurrencyRenderer( sel[i].get('price') )
                    ,sum: thousandCurrencyRenderer( sel[i].get('sum') )
                    ,product__okpd2__cripple_benefits: ColumnRenderer.yesNoNoneRenderer( sel[i].get('product__okpd2__cripple_benefits') )
                    ,product__okpd2__preferences: ColumnRenderer.yesNoNoneRenderer( sel[i].get('product__okpd2__preferences') )
                    ,uis: ColumnRenderer.yesNoNoneRenderer( sel[i].get('uis') )
                    ,source_order_ids: sel[i].get('order_item_id')
                    ,product_id: sel[i].get('product_id')
                    ,currency_id: sel[i].get('currency_id')
                    ,lotItemId: 0
                    ,direction_id: sel[i].get('direction_id')
                    ,product__info__ext_name: sel[i].get('product__info__ext_name')
                    ,taboo: sel[i].get('taboo')
                }));
            }

        }  
        node.endUpdate();
        node.expand();     
        
        // Нужно удалить из стора грида эти записи
        createConsOrderDetail(sel, sourceGrid.getStore(), node.attributes['source_order_ids'] );               
    }
}

/**
 * Драгим только нужные узлы
 */
function onDragOver(dragObj){
    if ( dragObj.target instanceof Ext.tree.TreeNode ){
        var node = dragObj.target;
        if (node.parentNode && node.parentNode.id == -1) {            
            return true;
        }

    }
    return false;
}

/**
 * Обновляет колонки в узле дерева
 */
function refreshNodeColumns(n) {
    var t = n.getOwnerTree();
    var a = n.attributes;
    var cols = t.columns;
    if (n.ui.getEl()) {
        var el = n.ui.getEl().firstChild; // <div class="x-tree-el">
        var cells = el.childNodes;
        
        //<div class="x-tree-col"><div class="x-tree-col-text">
        
        for(var i = 1, len = cols.length; i < len; i++)
        {
            var d = cols[i].dataIndex;
            var v = (a[d]!=null)? a[d] : '';
            if (cols[i].renderer) v = cols[i].renderer(v);
            cells[i].firstChild.innerHTML = v;        
        }
    }
}  

/**
 * Очистка исходного грида при D&D
 */
function createConsOrderDetail(records, src_store, cons_id){
    addPositions.push({records: records, order_id: cons_id});
    Ext.each(records, src_store.remove, src_store);       
}

/**
 * Сабмит формы
 */
var mask = new Ext.LoadMask(win.body);
function saveConsOrders(btn, e){
    mask.show();

    var rootNode = consolidationTree.getRootNode();

    var basicForm = mainForm.getForm();

    // Валидация
    if (!basicForm.isValid() || rootNode.childNodes.length === 0) {

        var msg = rootNode.childNodes.length ? 'На форме имеются некорректно заполненные поля': 'Должен быть создан хотя бы один лот'

        Ext.Msg.show({
            title: 'Проверка формы',
            msg: msg,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
        mask.hide();
        return;
    } else {
        var currencyId = null;
        var resOrders = [];
        var has791taboo = false;
        var hasNo791taboo = false;
        var consOrders = rootNode.childNodes;

        for (var i = 0; i < consOrders.length; i++) {
            var resOrderItems = [];
            if (consOrders[i].hasChildNodes()) {
                var consOrderItems = consOrders[i].childNodes;
                for (var j=0; j<consOrderItems.length; j++) {
                    if (currencyId &&
                        currencyId != consOrderItems[j].attributes.currency_id){
                        Ext.Msg.show({
                            title: 'Внимание!',
                            msg: 'Запрещено объединять в один лот ' +
                                'товарные позиции в разных валютах',
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.WARNING
                        });
                        mask.hide();
                        return;
                    }
                    currencyId = consOrderItems[j].attributes.currency_id;
                    if (consOrderItems[j].attributes.lotItemId == 0) {
                        resOrderItems.push(
                            consOrderItems[j].attributes['source_order_ids'].split(','));
                    }

                    if (consOrderItems[j].attributes['taboo'] == taboo791name){
                        has791taboo = true;
                    } else {
                        hasNo791taboo = true;
                    }
                }
            }
            var lot = {
                name: consOrders[i].attributes.consOrder,
                lotId: consOrders[i].attributes.lotId || 0,
                items: resOrderItems
            };
            resOrders.push(lot);

        }

        if (has791taboo && hasNo791taboo){
            Ext.Msg.show({
                title: 'Внимание!',
                msg: 'Запрещено объединять в один лот товарные позиции c ' +
                     'запретом ' + taboo791name + 'с товарными позициями ' + 
                     'с другими запретами или без запрета',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.WARNING
            });
            mask.hide();
            return;
        }

        var req = {
            url: '{{ component.check_contragent_url }}',
            params: Ext.apply(
                    {consolid_orders: Ext.encode(resOrders)},
                    win.actionContextJson),
            success: function(response, opt) {
                mask.hide();
                smart_eval(response.responseText);
                var r = Ext.decode(response.responseText);

                var p = {'consolid_orders': Ext.encode(resOrders)};
                p['replace_contragent'] = false;
                var params = Ext.apply(p, basicForm.getValues() || {});
                win.submitForm(btn, e, params);
            },
            failure: function(){
                mask.hide();
                uiAjaxFailMessage.apply(this, arguments);
            }
        };
        Ext.Ajax.request(req);

        Ext.Ajax.request({
            url: '{{ component.check_preferences_url }}',
            params: Ext.apply({consolid_orders: Ext.encode(resOrders)}, win.actionContextJson),
            success: function(response, opt) {

                var result = Ext.decode(response.responseText);
                if (result.success && result.message){
                    Ext.Msg.show({
                       title: 'Внимание!',
                       msg: result.message,
                       buttons: Ext.Msg.OK,
                       icon: Ext.Msg.WARNING
                    });
                }
            },
            failure: function(){
                mask.hide();
                uiAjaxFailMessage.apply(this, arguments);
            }
        });

        return;
    }
}

/**
 *  1. Вопрос - если позиция: спрашивать не обязательно. Если заявка нужно спрашивать 
 *  2. Если это позиция, удаляем только ее, если вся заявка, валим все позиции
 *  то есть востанавливаем в гриде заявок слева 
 */
function deleteNode(btn, event, node) {

    var selNode = Ext.isDefined(node) ? node :consolidationTree.getSelectionModel().getSelectedNode();
    if (selNode) { 
        if ( selNode.getDepth() == 1 ) {
            // Удаление заявки. Вопрос, если все норм, то валим заявку
            if (selNode.attributes.lotId > 0 ) {

                Ext.Msg.alert('Ошибка','Удаление сформированного лота запрещено');
                return;
            }

            Ext.Msg.show({
                title: 'Удаление',
                msg: 'Вы уверены, что хотите удалить лот?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                fn: function(buttonId, text, opt){                    
                    if (buttonId === 'yes') {
                        deleteOrder(selNode);                                
                    }
                }
            });
            return;
 
        } else {
            // Удаление позиции

            if (selNode.attributes.lotId > 0 || selNode.attributes.lotItemId > 0 ){
                Ext.Msg.alert('Ошибка','Удаление сохраненной позиции лота запрещено');
                return;
            }

            // Пр иудалении тов позиции по напарвлению,удаляться также должны
            // все позиции по данному направлению
            if(selNode.attributes['direction_id'] && !Ext.isDefined(node)){
                var rootNode = selNode.parentNode;
                var directionNodes = rootNode.childNodes.filter(function(node){
                    return node.attributes['direction_id'] == selNode.attributes['direction_id'];
                }, rootNode, true);
                Ext.each(directionNodes, function(item){
                    deleteNode(btn, event, item);
                });
            }

            var orderItemsIds = selNode.attributes['source_order_ids'].split(',')
                        
            for (var i=0; i<addPositions.length; i++ ) {
                
                if (selNode.parentNode.attributes['source_order_ids']  == addPositions[i].order_id ) {
                    var len = addPositions[i].records.length;
                    for (var j=len-1; j>=0; --j) {
                        var record = addPositions[i].records[j];

                        if ( orderItemsIds.indexOf( record.get('order_item_id')) != -1) {
                            ordersGrid.getStore().add(record);
                            addPositions[i].records.remove(record);                            
                        }                                         
                    }
                }               
            }
            
        }
        selNode.remove();    
        ordersGrid.getStore().groupBy('order_id', true);  
    }
}

/**
 * Удаление заявки по ноду
 */
function deleteOrder(node){
    for (var i=0; i<addPositions.length; i++ ) {
        if (node.attributes['source_order_ids']  == addPositions[i].order_id ) {
            ordersGrid.getStore().add(addPositions[i].records);
            addPositions.remove(addPositions[i]);  
            break;                
        }            
    }
    countConsOrder--;
    node.remove();    
    ordersGrid.getStore().groupBy('order_id', true);   
}

/**
 * Очистка списа консолидированных заявок
 */
function clearOrders(){
    Ext.Msg.show({
        title: 'Удаление',
        msg: 'Вы уверены, что хотите очистить список лотов?',
        buttons: Ext.Msg.YESNO,
        icon: Ext.Msg.QUESTION,
        fn: function(buttonId, text, opt){                    
            if (buttonId === 'yes') {
                var rootNode = consolidationTree.getRootNode();
                rootNode.removeAll();

                for (var i=0; i<addPositions.length; i++ ) {
                    ordersGrid.getStore().add(addPositions[i].records);                                         
                }
                addPositions = [];
                countConsOrder = 0;                        
                ordersGrid.getStore().groupBy('order_id', true);

                if (window.editMode) {
                    setInitialData();
                }
            }                                            
        }
    });    
} 

/*
Заполнение данными дерева при повторном редактировании лота
 */

function setInitialData() {
    var data = {{ component.initial_tree_data|safe }};

    var rootNode = consolidationTree.getRootNode();
    countConsOrder = 0;

    for (var i = 0; i < data.length; i++) {

        var lot = data[i];
        var lotNode = rootNode.appendChild(new Ext.tree.TreeNode({
            consOrder: lot.name
            ,lotId: lot.id
            ,lotItemId: 0
            ,allowDrag : false
            //,source_order_ids: (countConsOrder + 1)
        }));

        refreshNodeColumns(lotNode);

        for (var j = 0; j < lot.items.length; j++) {

            var item = lot.items[j];
            var itemNode = lotNode.appendChild( new Ext.tree.TreeNode({
                consOrder: item.name
                ,amount: thousandCurrencyRendererForPrice(item.amount)
                ,price: thousandCurrencyRenderer(item.price)
                ,sum: thousandCurrencyRenderer(item.sum)
                ,product__okpd2__cripple_benefits: ColumnRenderer.yesNoNoneRenderer(item.product__okpd2__cripple_benefits)
                ,product__okpd2__preferences: ColumnRenderer.yesNoNoneRenderer(item.product__okpd2__preferences)
                ,uis: ColumnRenderer.yesNoNoneRenderer(item.uis)
                ,product_id: item.product_id
                ,currency_id: item.currency_id
                ,lotId: 0
                ,lotItemId: item.id
                ,allowDrag: false
                ,product__info__ext_name: item.product__info__ext_name
                ,taboo: item.taboo
            }) );
            refreshNodeColumns(itemNode);

        }

        lotNode.expand();
        countConsOrder++;

    }
}

ordersGrid.on('click', function () {
	debugger;
	var model = ordersGrid.getSelectionModel();
	var selected = ordersGrid.getSelectionModel().getSelected();
	var store = ordersGrid.getStore();
	var items = ordersGrid.getStore().data.items;
	var parent;
	var indexs = [];
	// Если у выбранной записи есть родительский объект.
	if (selected.data.product__structured_position__parent_product_id) {
		var parent_id = selcted.data.product__structured_position__parent_product_id;
		items.forEach(function (record) {
			if (record.data.product_id == parent_id) {
				parent = record;
			}
		});
		if (parent) {
			indexs.push(store.indexOf(parent));
			items.forEach(function (record) {
				if (record.data.product__structured_position__parent_product_id == parent.data.product_id) {
					indexs.push(store.indexOf(record));
				}
			});
			// Если выбранная запись является родителем.
		}
	} else if (selected.data.product__is_parent == 'True') {
		
		items.forEach(function (record) {
			if (record.data.product__structured_position__parent_product_id == selected.data.product_id) {
				indexs.push(store.indexOf(record));
			}
		});
	}
	
  debugger;
});

asda
