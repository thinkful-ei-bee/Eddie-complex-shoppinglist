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
  items: [{id: cuid(), name: 'apples', checked: false},
    {id: cuid(), name: 'oranges', checked: false},
    {id: cuid(), name: 'milk', checked: true},
    {id: cuid(), name: 'bread', checked: false}
  ],
  hideCompleted: false,
  searchWord: false,
};

function generateItemHTML(item){
  return `
  <li data-item-id="${item.id}"> <span class="shopping-item ${item.checked ? 'shopping-item__checked' : ''}">${item.name}</span> <div class="shopping-item-controls"> <button class="shopping-item-toggle js-item-toggle"> <span class="button-label">check</span> </button> <button class="shopping-item-delete js-item-delete"> <span class="button-label">delete</span> </button> </div> </li>
  `;
}

function generateItemsHTML(arr){
  // this function will generate all of the STORE's items into the proper html format and combining them into one string
  const htmlArr = arr.map(generateItemHTML);
  return htmlArr.join('');
}

function generateItem(item){
  // this function will create an item object with the associated attributes
  return {id: cuid(), name: item, checked: false};
}

function addItemToShoppingList(item){
  // this function will add an item to the STORE's items 
  STORE.items.push(generateItem(item));
}

function getItemIdFromElement(element){
  // this function will find the id of the provide element assuming the structure is the same as the generateIteHTML function
  console.log('getItemIdFromElement ran');
  return $(element)
    .closest('li')
    .data('item-id');
}

function toggleCheckedForListItem(id){
  // this function will toggle the specific item's check attribute of the given id
  const item = STORE.items.find(item => item.id === id);
  item.checked = !item.checked; 
}

function toggleHideFilter(){
  // this function will toggle the STORE's hideCompleted attribute
  STORE.hideCompleted = !STORE.hideCompleted;
}

function deleteItemFromList(id){
  // this function will delete an item from the given id
  const index = STORE.items.findIndex(item => item.id === id);
  if (index === -1) return;
  STORE.splice(index,1);
}

function assignSearchWord(word){
  // this function assigns STORE's search word to the given word
  STORE.searchWord = word;
}

function renderShoppingList() {
  // this function will be responsible for rendering the shopping list in
  // the DOM
  console.log('`renderShoppingList` ran');
  let filteredItems = [...STORE.items];
  if (STORE.hideCompleted){
    filteredItems = filteredItems.filter(item => !item.checked);
  } 
  if (STORE.searchWord){
    console.log('FILTERING>>>');
    filteredItems = filteredItems.filter(item => item.name.includes(STORE.searchWord));
  }
  const htmlString = generateItemsHTML(filteredItems);
  $('.js-shopping-list').html(htmlString);

}


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
  // this function will be responsible for when users click on the search button to show the items the contain the inputed word
  $('#js-search-form').on('submit',function(e){
    e.preventDefault();
    const input = $('.js-shopping-list-search');
    assignSearchWord(input.val());
    input.val('');
    renderShoppingList();
    STORE.searchWord = false;
  })
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
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);