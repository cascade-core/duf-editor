
all: doc

tests:
	echo ; pear run-tests ./test ; echo

doc:
	make -C doc/

test: tests

.PHONY: all tests test doc

