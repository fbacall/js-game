class LinkedList {
    constructor () {
        this.first = null;
        this.last = null;
        this.count = 0;
    }

    add (item) {
        // Add to end of linked list
        item.prev = this.last;
        if (this.last !== null)
            this.last.next = item;
        this.last = item;
        // If list was empty, first node should point to new item also.
        if (this.first === null)
            this.first = item;

        this.count++;
    }

    remove (item) {
        if (item.prev === null)
            this.first = item.next;
        else
            item.prev.next = item.next;
        if (item.next === null)
            this.last = item.prev;
        else
            item.next.prev = item.prev;

        this.count--;
    }

    each (lambda) {
        let current = this.first;
        while (current) {
            const result = lambda(current);
            if (typeof result !== 'undefined' && !result) // Stop iterating if "false" is returned
                break;
            current = current.next;
        }
    }
}
