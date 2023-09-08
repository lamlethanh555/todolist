import express from 'express';
import bodyParser from 'body-parser';
import { dirname } from 'path';
import { mongoose } from 'mongoose';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// const port = 3000;
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const url = 'mongodb://127.0.0.1:27017';
mongoose.connect('mongodb+srv://lamlethanh55:Westboys132@cluster0.gk4j1eu.mongodb.net/todolistDB');

const itemsSchema = {
    name: {
        type: String,
        //required: [true, `You haven't add a task to your list`],
    },
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Welcome to your todolist',
});

const item2 = new Item({
    name: 'Hit the + button to add a new item',
});

const item3 = new Item({
    name: '<-- Hit this to delete an item',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

var dayInWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function todayDate() {
    const date = new Date();
    const dayWeek = dayInWeek[date.getDay()];
    const dateNow = date.getDate();
    const monthNow = date.getMonth();
    const yearNow = date.getFullYear();
    return dayWeek + ', ' + month[monthNow] + ' ' + dateNow + ' ' + yearNow;
}

app.get('/', async (req, res) => {
    const day = todayDate();
    const todayList = await Item.find({});
    if (todayList.length === 0) {
        await Item.insertMany([item1, item2, item3])
            .then(function () {
                console.log('Data inserted'); // Success
            })
            .catch(function (error) {
                console.log(error); // Failure
            });
        res.redirect('/');
    } else {
        res.render('index.ejs', { title: 'Today', newListItems: todayList });
    }
});

// app.get('/work', (req, res) => {
//     const title = 'Work List';

//     res.render('index.ejs', { title: title, newListItems: todayList });
// });

app.post('/', async (req, res) => {
    var itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName,
    });

    async function myAdd() {
        if (listName === 'Today') {
            await item.save();
        } else {
            const checkList = await List.findOne({ name: listName });
            if (checkList) {
                checkList.items.push(item);
                await checkList.save();
            }
        }
    }
    myAdd();
    if (listName === 'Today') {
        res.redirect('/');
    } else {
        res.redirect('/' + listName);
    }

    // if (listName === 'Today') {
    //     item.save();
    //     res.redirect('/');
    // } else {
    //     const checkList = await List.findOne({ name: listName });
    //     if (checkList) {
    //         checkList.items.push(item);
    //         await checkList.save();
    //         res.redirect('/' + listName);
    //     }
    // }
});

app.post('/delete', (req, res) => {
    const listName = req.body.listName;
    async function myDelete() {
        const checkedId = req.body.checkbox;

        if (listName === 'Today') {
            const del = await Item.findByIdAndRemove(checkedId);
        } else {
            const del = await List.findOneAndUpdate(
                { name: listName },
                { $pull: { items: { _id: checkedId } } },
                {
                    new: true,
                },
            );
        }
    }
    myDelete();
    if (listName === 'Today') {
        res.redirect('/');
    } else {
        res.redirect('/' + listName);
    }
});

// app.post('/work', (req, res) => {
//     var work = req.body.newItem;
//     todayList.push(work);
//     res.redirect('/work');
// });

app.get('/:customListName', async function (req, res) {
    const customName = req.params.customListName;
    const checkList = await List.findOne({ name: customName });
    if (!checkList) {
        const list = new List({
            name: customName,
            items: defaultItems,
        });
        list.save();
        res.redirect('/' + customName);
    } else {
        res.render('index.ejs', { title: checkList.name, newListItems: checkList.items });
    }
});

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port, () => {
    console.log(`Listening on port 3000`);
});
