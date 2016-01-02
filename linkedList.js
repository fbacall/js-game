function LinkedList() {
    this.first = null;
    this.last = null;
    this.count = 0;
}

// Add to linked list
LinkedList.prototype.add = function (item) {
    // Add to end of linked list
    item.prev = this.last;
    if(this.last != null)
        this.last.next = item;
    this.last = item;
    // If list was empty, first node should point to new item also.
    if(this.first == null)
        this.first = item;

    this.count++;
};

// Remove from linked list
LinkedList.prototype.remove = function (item) {
    if(item.prev == null)
        this.first = item.next;
    else
        item.prev.next = item.next;
    if(item.next == null)
        this.last = item.prev;
    else
        item.next.prev = item.prev;

    this.count--;
};

// Iterate over linked list
LinkedList.prototype.each = function (lambda) {
    var current = this.first;
    if(current) {
        do {
            var r = lambda(current);
            if(typeof r != 'undefined' && !r) // Stop iterating if "false" is returned
                break;
        } while(current = current.next);
    }
};
