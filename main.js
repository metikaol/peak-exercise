const fs = require("fs");

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

function main() {
  const filename = "input.txt";
  const commands = getCommandsFromFileName(filename);
  let hotel = []
  let keyCards = []

  commands.forEach((command) => {
    switch (command.name) {
      case "create_hotel":
        const [floor, roomPerFloor] = command.params;
        hotel = createHotel(floor, roomPerFloor)
        keyCards = createKeyCards(floor, roomPerFloor)
        console.log(`Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`);
        return;
      case "list_available_rooms":
        const availableRooms = getAvailableRooms(hotel)
        console.log(availableRooms.join(', '))
        return
      case "list_guest":
        const listGuest = getListGuest(hotel)
        console.log(listGuest.join(', '))
        return
      case "list_guest_by_age":
        const [comparison, byAge] = command.params
        const listGuestByAge = getListGuestByAge(hotel, comparison, byAge)
        console.log(listGuestByAge.join(', '))
        return
      case "list_guest_by_floor":
        const [byFloor] = command.params
        const listGuestByFloor = getListGuestByFloor(hotel, byFloor)
        console.log(listGuestByFloor.join(', '))
        return
      case "get_guest_in_room":
        const [guestRoom] = command.params
        const guest = hotel.find((e) => e.room == guestRoom)?.name
        console.log(guest)
        return
      case "book_by_floor":
        const [floorToBook, bookName, bookAge]  = command.params
        const isFloorAvilableToBook = checkFloorAvailableToBook(hotel, floorToBook)
        if (isFloorAvilableToBook) {
            const roomsToBook = getRoomsToBookByFloor(hotel, floorToBook)
            const updateValue = updateBookRooms(hotel, roomsToBook, keyCards, bookName, bookAge)
            hotel = updateValue.hotel
            const bookedKeyCards = updateValue.bookedKeyCards
            console.log(`Room ${roomsToBook.join(', ')} are booked with keycard number ${bookedKeyCards.join(', ')}`)
        }else{
            console.log(`Cannot book floor ${floorToBook} for ${bookName}.`)
        }
        return
      case "book":
        const [room, name, age] = command.params;
        const selectedRoom = hotel.find((e) => e.room == room);
        if (selectedRoom.name == '') {
            const updateValue = updateBookRooms(hotel, [selectedRoom.room], keyCards, name, age)
            hotel = updateValue.hotel
            const bookedKeyCards = updateValue.bookedKeyCards
            console.log(`Room ${room} is booked by ${name} with keycard number ${bookedKeyCards.join(', ')}.`)
        } else {
            console.log(`Cannot book room ${room} for ${name}, The room is currently booked by ${selectedRoom.name}.`)
        }
        return
      case "checkout_guest_by_floor":
        const [floorToCheckout] = command.params
        const roomsToCheckout = getRoomsToCheckoutByFloor(hotel, floorToCheckout)
        if (roomsToCheckout.length) {
            hotel = updateCheckoutRooms(hotel, roomsToCheckout, keyCards)
            console.log(`Room ${roomsToCheckout.join(', ')} are checkout.`)
        }
        return
      case "checkout":
        const [checkoutKeyCard, checkoutName] = command.params
        const checkoutRoom = hotel.find((e) => e.keyCard == checkoutKeyCard)
        if (checkoutRoom.name == checkoutName) {
            hotel = updateCheckoutRooms(hotel, [checkoutRoom.room], keyCards)
            console.log(`Room ${checkoutRoom.room} is checkout.`)
        } else {
            console.log(`Only ${checkoutRoom.name} can checkout with keycard number ${checkoutRoom.keyCard}.`)
        }
        return
      default:
        return;
    }
  });
}

// get rooms for check out by floor
function getRoomsToCheckoutByFloor(hotel, floorToCheckout) {
    const roomsToCheckout = []
    hotel.forEach(val => {
        if (val.floor === floorToCheckout && val.name) {
            roomsToCheckout.push(val.room)
        }
    })

    return roomsToCheckout
}

// update hotel object data when check out rooms
function updateCheckoutRooms(hotel, roomsToCheckout, keyCards) {
    return hotel.map((val) => {
        if(roomsToCheckout.includes(val.room)) {
            returnKeyCard(val.keyCard, keyCards)
            return {
                ...val,
                name: '',
                age: '',
                keyCard: '',
            }
        } else {
            return val
        }
    })
}

// check if selected floor is available for booking
function checkFloorAvailableToBook(hotel, floorToBook) {
    result = true
    hotel.forEach(val => {
        if (val.floor === floorToBook && val.name) {
            result = false
        }
    })
    return result
}

// get rooms for booking by floor
function getRoomsToBookByFloor(hotel, floorToBook) {
    const roomsToBook = []
    hotel.forEach(val => {
        if (val.floor === floorToBook) {
            roomsToBook.push(val.room)
        }
    })
    return roomsToBook
}

// update hotel object when booking rooms
function updateBookRooms(hotel, roomsToBook, keyCards, name, age) {
    const bookedKeyCards = []
    hotel = hotel.map((val) => {
        if (roomsToBook.includes(val.room)) {
            const keyCard = getKeyCard(keyCards)
            bookedKeyCards.push(keyCard)

            return {
                ...val,
                name,
                age,
                keyCard,
            } 
        } else {
          return  val
        }
    })
    return {hotel, bookedKeyCards}
}

// get gests by floor
function getListGuestByFloor(hotel, byFloor) {
    const listGuestByFloor = []
    hotel.forEach(val => {
        if (val.floor === byFloor && val.name && !listGuestByFloor.includes(val.name)) {
            listGuestByFloor.push(val.name)
        }
    })

    return listGuestByFloor
}

// get guests by age
function getListGuestByAge(hotel, comparison, byAge) {
    const listGuestByAge = []
    if (comparison === '<') {
        hotel.forEach(val => {
            if (val.name && val.age < byAge && !listGuestByAge.includes(val.name)) {
                listGuestByAge.push(val.name)
            }
        })
    }

    return listGuestByAge
}

// get all guest
function getListGuest(hotel) {
    const listGuest = []
    hotel.forEach(val => {
        if (val.name && !listGuest.includes(val.name)) {
            listGuest.push(val.name)
        }
    })
    return listGuest
}

// get all available rooms
function getAvailableRooms(hotel) {
    const availableRooms = []
    hotel.forEach(val => {
        if (val.name == '') {
            availableRooms.push(val.room)
        }
    })
    return availableRooms
}

// return keycard when check out
function returnKeyCard(checkoutKeyCard, keyCards) {
    keyCards.push(checkoutKeyCard)
    keyCards.sort((a, b) => a - b)
}

// get keycard when booking rooms
function getKeyCard(keyCards) {
    return keyCards.shift()
}

// create keyCards that will be used for all rooms
function createKeyCards(floor, roomPerFloor) {
    const keyCards = []
    for (let i =1; i<= floor*roomPerFloor; i++) {
        keyCards.push(i)
    }

    return keyCards
}

// create hotel object to keep data(floor, room, name, age, keycard) for each room
function createHotel(floor, roomPerFloor) {
    const hotel = []
    for(let i = 1; i<=floor; i++) {
        for(let j=1; j<=roomPerFloor; j++ ) {
            rooms = {
                floor: i,
                room: j < 10 ? parseInt(`${i}0${j}`) : parseInt(`${i}${j}`),
                name: '',
                age: '',
                keyCard: ''
            }
            hotel.push(rooms)
        }
    }
    return hotel
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, "utf-8");

  return file
    .split("\n")
    .map((line) => line.split(" "))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map((param) => {
            const parsedParam = parseInt(param, 10);

            return Number.isNaN(parsedParam) ? param : parsedParam;
          })
        )
    );
}

main();
