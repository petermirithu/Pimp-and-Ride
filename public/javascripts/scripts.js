$('#menu ul li').click(function(){
    $('#menu ul li').removeClass("active");
    $(this).addClass("active");    
});

$("#cartbadge").animatedModal({
    animatedIn:'lightSpeedIn',
    animatedOut:'bounceOutDown',
    color:'rgba(0,0,0,0.8)',
})

$("#mpesano").animatedModal({
    animatedIn:'lightSpeedIn',
    animatedOut:'bounceOutDown',
    color:'rgba(0,0,0,0.8)',
})
