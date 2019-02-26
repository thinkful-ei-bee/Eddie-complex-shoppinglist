'use strict';
/*global cuid*/

// `STORE` is responsible for storing the underlying data
// that our app needs to keep track of in order to work.
//
// for a shopping list, our data model is pretty simple.
// we just have an array of shopping list items. each one
// is an object with a `name` and a `checked` property that
// indicates if it's checked off or not.
// we're pre-adding items to the shopping list so there's
// something to see when the page first loads.
const STORE = {
  items: [{id: cuid(), name: 'apples', checked: false, isEditing: false},
    {id: cuid(), name: 'oranges', checked: false, isEditing: false},
    {id: cuid(), name: 'milk', checked: true, isEditing: false},
    {id: cuid(), name: 'bread', checked: false, isEditing: false}
  ],
  hideCompleted: false,
  searchWord: false,
};

/********************* Generate Functions **************************/

function generateItemHTML(item){
  const checkedClass = item.checked ? 'shopping-item__checked' : '';
  const checkButtonName = item.checked ? 'uncheck' : 'check';
  let itemHTML =  `
    <span class="shopping-item ${checkedClass}">${item.name}</span> 
    <div class="shopping-item-controls"> 
      <button class="shopping-item-toggle js-item-toggle"> <span class="button-label">${checkButtonName}</span> </button>
      <button class="shopping-item-edit js-toggle-edit"> <span class="button-label">edit</span> </button> 
      <button class="shopping-item-delete js-item-delete"> <span class="button-label">delete</span> </button> 
    </div> `;

  if (item.isEditing){
    itemHTML = `
    <form id="js-edit-form">
      <input type="text" id="name" class="js-updated-name shopping-item" name="name" value="${item.name}">
      <div class="shopping-item-controls">
      <button type="button"class="shopping-item-cancel-edit js-toggle-edit">cancel</button>
      <button type="submit" class="shopping-item-save-edit js-save-edit">save</button>
      </div>
    </form>`;
  }
  return `
  <li class="js-item-element" data-item-id="${item.id}"> 
    ${itemHTML}
  </li>`;
}

function generateItemsHTMLString(arr){
  // this function will generate all of the STORE's items into the proper html format 
  // and combine them into one string
  const htmlArr = arr.map(generateItemHTML);
  return htmlArr.join('');
}

function generateItem(item){
  // this function will create an item object with the associated attributes
  return {id: cuid(), name: item, checked: false, isEditing: false};
}

function generateClearButton(){
  // this function creates the clear button at the clear search controls
  //$('.clear-search-controls').html('<button class="clear-search js-clear-search">Clear Search</button>');
  let clearButtonHTML = '<button class="clear-search js-clear-search">Clear Search</button>';
  if (!STORE.searchWord){
    clearButtonHTML = '';
  }
  return clearButtonHTML;
}

/********************* Toggle Functions **************************/

function toggleCheckedForListItem(id){
  // this function will toggle the specific item's check attribute of the given id
  const item = STORE.items.find(item => item.id === id);
  item.checked = !item.checked; 
}

function toggleHideFilter(){
  // this function will toggle the STORE's hideCompleted attribute
  STORE.hideCompleted = !STORE.hideCompleted;
}

function toggleEditMode(id){
  STORE.items.map(function(item){
    item.isEditing = (item.id === id ? !item.isEditing : false)
  });
}

/********************* STORE Altering Functions **************************/

function addItemToShoppingList(item){
  // this function will add an item to the STORE's items 
  STORE.items.unshift(generateItem(item));
}

function deleteItemFromList(id){
  // this function will delete an item from the given id
  const index = STORE.items.findIndex(item => item.id === id);
  if (index === -1) return;
  STORE.items.splice(index,1);
}

function assignSearchWord(word){
  // this function assigns STORE's search word to the given word
  STORE.searchWord = word;
}

function editName(id,name){
  // this function edits the name inside of the STORE
  const item = STORE.items.find(item => item.id === id);
  item.name = name;
}

function getItemIdFromElement(element){
  // this function will find the id of the provide element assuming the structure is 
  // the same as the generateIteHTML function
  console.log('getItemIdFromElement ran');
  return $(element)
    .closest('li')
    .data('item-id');
}

/********************* Render Function **************************/

function renderShoppingList() {
  // this function will be responsible for rendering the shopping list in
  // the DOM
  console.log('`renderShoppingList` ran');
  let filteredItems = [...STORE.items];
  if (STORE.hideCompleted){
    filteredItems = filteredItems.filter(item => !item.checked);
  } 
  if (STORE.searchWord){
    filteredItems = filteredItems.filter(item => item.name.includes(STORE.searchWord));
  }
  const htmlString = generateItemsHTMLString(filteredItems);
  $('.js-shopping-list').html(htmlString);

}

function renderClearButton(){
  const clearButtonHTML = generateClearButton();
  $('.clear-search-controls').html(clearButtonHTML);
}

function renderAll(){
  renderShoppingList();
  renderClearButton();
}

/********************* Handle Functions **************************/

function handleNewItemSubmit() {
  // this function will be responsible for when users add a new shopping list item
  console.log('`handleNewItemSubmit` ran');
  $('#js-shopping-list-form').on('submit',function(e){
    console.log('Submitting...');
    e.preventDefault();
    console.log(e);
    addItemToShoppingList($('.js-shopping-list-entry').val());
    $('.js-shopping-list-entry').val('');
    renderShoppingList();
  });
}

function handleItemCheckClicked() {
  // this function will be responsible for when users click the "check" button on
  // a shopping list item.
  console.log('`handleItemCheckClicked` ran');
  $('.js-shopping-list').on('click','.js-item-toggle',function(e){
    const id = getItemIdFromElement(e.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}

function handleDeleteItemClicked() {
  // this function will be responsible for when users want to delete a shopping list
  // item
  console.log('`handleDeleteItemClicked` ran');
  $('.js-shopping-list').on('click','.js-item-delete',function(e){
    const id = getItemIdFromElement(e.currentTarget);
    deleteItemFromList(id);
    renderShoppingList();
  });
}

function handleToggleHideFIlter(){
  // this function will be responsible for when users click on the hide filter checkbox
  $('.js-hide-completed-toggle').on('click',function(){
    toggleHideFilter();
    renderShoppingList();
  });
}

function handleSearchClicked(){
  // this function will be responsible for when users click on the search button to show 
  // the items the contain the inputed word
  $('#js-search-form').on('submit',function(e){
    e.preventDefault();
    const input = $('.js-shopping-list-search');
    assignSearchWord(input.val());
    input.val('');
    renderAll();
  });
}

function handleClearSearchClicked(){
  // this function will be responsible for when users click on the clear button to clear 
  // the search results and display all of the list again
  $('.clear-search-controls').on('click','.js-clear-search',function(){
    STORE.searchWord = false;
    renderAll();
  });

}

function handleToggleItemEdit(){
  // this function will be responsible for when users are focused on an item
  $('.js-shopping-list').on('click','.js-toggle-edit',function(e){
    const id = getItemIdFromElement(e.currentTarget);
    const item = STORE.items.find(item => item.id === id);
    toggleEditMode(id);
    renderShoppingList();
    if (item.isEditing){
      // Logic to have focus at the end of the value inside of the input
      let strLength = $('#name').val().length * 2;
      $('#name').focus();
      $('#name')[0].setSelectionRange(strLength, strLength);
    }
  });
}

function handleEditItemSubmit(){
  // this function will be responsible for when users submit a change to an item's name
  $('.js-shopping-list').on('submit','#js-edit-form',function(e){
    e.preventDefault();
    const input = $('#name').val();
    const id = getItemIdFromElement(e.currentTarget);
    editName(id,input);
    toggleEditMode(id);
    renderShoppingList();
  });
}

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFIlter();
  handleSearchClicked();
  handleClearSearchClicked();
  handleToggleItemEdit();
  handleEditItemSubmit();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);