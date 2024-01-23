import express from 'express'
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import { __dirname } from './utils.js';
import viewsRouter from './routes/views.routes.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io';
import { ProductManager } from './productManager.js';
//Importaciones necesarias para trabajar

const manager1 = new ProductManager('./products.json');
const app = express();
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Servicio arctivo en puerto ${PORT}`)
})
const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
    console.log('Nuevo cliente conectado');

    socket.on('addProduct', async (newProduct) => {
        // Agrega el nuevo producto al archivo JSON utilizando tu ProductManager
        try {
            await manager1.addProduct(newProduct);
            console.log('Producto añadido correctamente al archivo JSON:', newProduct);
            socketServer.emit('productAdded', newProduct);
        } catch (error) {
            console.error('Error al agregar el producto al archivo JSON:', error);
        }
    });

    
    socket.on('deleteProduct', async (productId) => {
        try {
            await manager1.deleteProduct(productId);
            console.log('Producto eliminado correctamente del archivo JSON:', productId);
            socketServer.emit('productDeleted', productId);
        } catch (error) {
            console.error('Error al eliminar el producto del archivo JSON:', error);
            socket.emit('error', { message: 'Error al eliminar el producto' });
        }
    });
    
})



app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/products', viewsRouter);


app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.use('/static', express.static(`${__dirname}/public`));