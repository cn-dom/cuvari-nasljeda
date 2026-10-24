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

/**
 * Use the official PatriaSoul crest bundled with the release package when
 * the site administrator has not selected a custom logo. Never override a
 * logo already chosen in WordPress.
 */
add_filter('get_custom_logo', function ($html) {
    if (has_custom_logo()) {
        return $html;
    }

    $logo_file = get_stylesheet_directory() . '/assets/patriasoul-logo.png';
    if (!is_readable($logo_file)) {
        return $html;
    }

    $logo_url = get_stylesheet_directory_uri() . '/assets/patriasoul-logo.png';
    $site_name = get_bloginfo('name', 'display');
    $alt = $site_name ? $site_name . ' – službeni logotip' : 'PatriaSoul – službeni logotip';

    return sprintf(
        '<a href="%1$s" class="custom-logo-link" rel="home"><img src="%2$s" class="custom-logo" alt="%3$s" width="512" height="512" decoding="async" fetchpriority="high"></a>',
        esc_url(home_url('/')),
        esc_url($logo_url),
        esc_attr($alt)
    );
});

add_action('after_setup_theme', function () {
    add_theme_support('custom-logo', array(
        'height'      => 120,
        'width'       => 320,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    add_theme_support('editor-styles');
    add_editor_style('style.css');
    add_theme_support('editor-color-palette', array(
        array('name' => 'PatriaSoul – tamnoplava', 'slug' => 'patriasoul-navy', 'color' => '#081629'),
        array('name' => 'PatriaSoul – plava', 'slug' => 'patriasoul-blue', 'color' => '#2462a4'),
        array('name' => 'PatriaSoul – crvena', 'slug' => 'patriasoul-red', 'color' => '#d92736'),
        array('name' => 'PatriaSoul – bijela', 'slug' => 'patriasoul-white', 'color' => '#f5f7fb'),
        array('name' => 'PatriaSoul – zlatna', 'slug' => 'patriasoul-gold', 'color' => '#e1b955'),
    ));

    // Register optional PatriaSoul menu locations without replacing Blocksy's builder.
    register_nav_menus(array(
        'patriasoul-primary' => 'PatriaSoul – glavni izbornik',
        'patriasoul-footer'  => 'PatriaSoul – izbornik podnožja',
    ));
});
