module random_m

    use iso_c_binding
    use mod_dill

    implicit none

    character, parameter :: nullc = c_null_char

    ! 127.0.0.1 is not accessible outside of docker, but 0.0.0.0 is
    character(len = *), parameter :: ipaddr_ = "0.0.0.0"
    !character(len = *), parameter :: ipaddr_ = "127.0.0.1"

    integer(c_int), parameter :: port = 5456

contains

!===============================================================================

function len_sz(str_)
    character(len = *), intent(in) :: str_
    integer(c_size_t) :: len_sz
    len_sz = len(str_)
end function len_sz

!===============================================================================

integer function rand_int(min_, max_)
    integer, intent(in) :: min_, max_

    double precision :: double_

    ! TODO roll our own rng just for lulz
    call random_number(double_)
    rand_int = int(double_ * (max_ - min_ + 1)) + min_

end function rand_int

!===============================================================================

end module random_m
