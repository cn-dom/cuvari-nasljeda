<?php
/**
 * PatriaSoul Blocksy child theme bootstrap.
 * Visual-only customizations belong here; application features belong in plugins.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Load the child stylesheet late, without relying on a parent-theme handle
 * that may change between Blocksy releases. Blocksy itself remains in charge
 * of its header/footer builder, layout, and Customizer settings.
 */
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'patriasoul-blocksy-child',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}, 99);

add_action('after_setup_theme', function () {
    add_theme_support('custom-logo', array(
        'height'      => 120,
        'width'       => 320,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    add_theme_support('editor-styles');
    add_editor_style('style.css');

    // Register PatriaSoul locations without replacing Blocksy's own header/footer builder.
    register_nav_menus(array(
        'patriasoul-primary' => 'PatriaSoul – glavni izbornik',
        'patriasoul-footer'  => 'PatriaSoul – izbornik podnožja',
    ));
});
