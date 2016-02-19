import $ from 'jquery';
import {Transition, isWithin, requestAnimationFrame} from '../util/index';

export default function (UIkit) {

    UIkit.component('navbar', {

        props: {
            dropdown: String,
            mode: String,
            pos: String,
            offset: Number,
            justify: Boolean,
            boundary: String,
            cls: String,
            delayShow: Number,
            delayHide: Number,
            overlay: Boolean,
            duration: Number
        },

        defaults: {
            dropdown: '.uk-navbar-nav > li',
            mode: 'hover',
            pos: 'bottom-left',
            offset: 0,
            justify: false,
            boundary: window,
            cls: 'uk-navbar-dropdown',
            delayHide: 800,
            hoverIdle: 200,
            overlay: false,
            duration: 200
        },

        ready() {

            UIkit.drop(this.$el.find(this.dropdown + ':not([uk-drop], [uk-dropdown])'), {
                mode: this.mode,
                pos: this.pos,
                offset: this.offset,
                justify: this.justify ? this.$el : false,
                boundary: this.boundary,
                cls: this.cls,
                flip: 'x',
                delayShow: this.delayShow,
                delayHide: this.delayHide
            });

            if (!this.overlay) {
                return;
            }

            this.overlay = typeof this.overlay === 'string' ? $(this.overlay) : this.overlay;

            if (!this.overlay.length) {
                this.overlay = $('<div class="uk-dropdown-overlay"></div>').insertAfter(this.$el);
            }

            var height, transition;

            this.$el.on({

                show: (e, drop) => {

                    drop.$el.removeClass('uk-open');

                    var newHeight = drop.drop.outerHeight(true);
                    if (height === newHeight) {

                        if (transition && transition.state() !== 'pending') {
                            drop.$el.addClass('uk-open');
                        }

                        return;
                    }
                    height = newHeight;

                    transition = Transition.start(this.overlay, {height: drop.drop.outerHeight(true)}, this.duration).then(() => {
                        var active = this.getActive();
                        if (active) {
                            active.$el.addClass('uk-open');
                            active.$update();
                        }
                    });

                },

                hide: () => {
                    requestAnimationFrame(() => {
                        if (!this.getActive()) {
                            Transition.stop(this.overlay).start(this.overlay, {height: 0}, this.duration);
                            height = 0;
                        }
                    });
                }

            });

            this.overlay.on({

                mouseenter: () => {
                    var active = this.getActive();
                    if (active) {
                        active.clearTimers();
                    }
                },

                mouseleave: (e) => {
                    var active = this.getActive();
                    if (active && !isWithin(e.relatedTarget, active.$el)) {
                        active.hide();
                    }
                }

            });

        },

        methods: {

            getActive() {
                var active = UIkit.drop.getActive();
                if (active && isWithin(active.$el, this.$el)) {
                    return active;
                }
            }

        }

    });

}