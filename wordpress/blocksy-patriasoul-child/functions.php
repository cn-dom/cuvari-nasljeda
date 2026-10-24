<?php
/**
 * PatriaSoul Blocksy child theme bootstrap.
 * Visual-only customizations belong here; application features belong in plugins.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', function () {
    $parent_style = 'blocksy-styles';
    wp_enqueue_style(
        'patriasoul-blocksy-child',
        get_stylesheet_uri(),
        array($parent_style),
        wp_get_theme()->get('Version')
    );
}, 20);

add_action('after_setup_theme', function () {
    add_theme_support('custom-logo', array(
        'height'      => 120,
        'width'       => 320,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    add_theme_support('editor-styles');
    add_editor_style('style.css');
});
