import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Favorites from './pages/Favorites';
import Admin from './pages/Admin';


export const PAGES = {
    "Home": Home,
    "Catalog": Catalog,
    "ProductDetail": ProductDetail,
    "Checkout": Checkout,
    "Favorites": Favorites,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};