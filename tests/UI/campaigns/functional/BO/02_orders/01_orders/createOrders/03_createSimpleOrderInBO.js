require('module-alias/register');

const helper = require('@utils/helpers');

// Import pages
const dashboardPage = require('@pages/BO/dashboard');
const ordersPage = require('@pages/BO/orders');
const addOrderPage = require('@pages/BO/orders/add');
const viewOrderPage = require('@pages/BO/orders/view');

// Import login steps
const loginCommon = require('@commonTests/loginBO');

// Import data

// Customer
const {DefaultAccount} = require('@data/demo/customer');

// Products
const {Products} = require('@data/demo/products');

// Order status
const {Statuses} = require('@data/demo/orderStatuses');

// Carriers
const {Carriers} = require('@data/demo/carriers');

// Order to make data
const orderToMake = {
  customer: DefaultAccount,
  products: [
    {value: Products.demo_5, quantity: 4},
  ],
  deliveryAddress: 'Mon adresse',
  invoiceAddress: 'Mon adresse',
  deliveryOption: {
    name: `${Carriers[1].name} - ${Carriers[1].delay}`,
    freeShipping: true,
  },
  paymentMethod: 'Payments by check',
  orderStatus: Statuses.paymentAccepted,

  totalPrice: (Products.demo_5.price * 4) * 1.2, // Price tax included
};

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_orders_orders_createOrders_createSimpleOrderInBO';

// Import expect from chai
const {expect} = require('chai');

let browserContext;
let page;

/*
Go to
 */
describe('Create simple order in BO', async () => {
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to orders page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.ordersParentLink,
      dashboardPage.ordersLink,
    );

    const pageTitle = await ordersPage.getPageTitle(page);
    await expect(pageTitle).to.contains(ordersPage.pageTitle);
  });

  it('should go to create order page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCreateOrderPage', baseContext);

    await ordersPage.goToCreateOrderPage(page);
    const pageTitle = await addOrderPage.getPageTitle(page);
    await expect(pageTitle).to.contains(addOrderPage.pageTitle);
  });

  describe('Choose which customer to order with', async () => {
    it('should search for existent customer and check customer card', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createOrder', baseContext);

      await addOrderPage.createOrder(page, orderToMake);
      const pageTitle = await viewOrderPage.getPageTitle(page);
      await expect(pageTitle).to.contain(viewOrderPage.pageTitle);
    });

    it('should check order status after creation', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkOrderStatus', baseContext);

      const orderStatus = await viewOrderPage.getOrderStatus(page);
      await expect(orderStatus).to.equal(orderToMake.orderStatus.status);
    });

    it('should check order total price after creation', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkOrderPrice', baseContext);

      const totalPrice = await viewOrderPage.getOrderTotalPrice(page);
      await expect(totalPrice).to.equal(orderToMake.totalPrice);
    });
  });
});
