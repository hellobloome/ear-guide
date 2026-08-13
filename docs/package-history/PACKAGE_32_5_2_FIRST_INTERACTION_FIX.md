# Package 32.5.2 — First interaction fix

The native 3D overlay now opens from the completed pointer tap rather than relying only on a later delegated click. This avoids the first interaction being consumed while the selected point interface is settling.

Keyboard activation remains supported, and duplicate activation from the same tap is suppressed. The frozen Beta 1B.10 coordinate library and Ear 1 model are unchanged.
